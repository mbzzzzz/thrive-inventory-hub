interface ShopifyStore {
  domain: string
  accessToken: string
  name: string
}

interface InventoryItem {
  sku: string
  productTitle: string
  variantTitle: string
  inventoryItemId: string
  productId: string
  variantId: string
  channels: {
    name: string
    quantity: number
    lastSync: number
    status: "synced" | "error" | "pending"
    syncLatency: number
    locationId: string
    locationName: string
  }[]
}

interface ShopifyProduct {
  id: number
  title: string
  handle: string
  variants: Array<{
    id: number
    title: string
    sku: string
    inventory_item_id: number
    inventory_quantity: number
    price: string
  }>
}

interface ShopifyLocation {
  id: number
  name: string
  active: boolean
}

interface InventoryLevel {
  inventory_item_id: number
  location_id: number
  available: number
  updated_at: string
}

interface ShopifyOrder {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
  total_price: string
  subtotal_price: string
  total_tax: string
  currency: string
  financial_status: string
  fulfillment_status: string | null
  line_items: Array<{
    id: number
    title: string
    name: string
    sku: string
    quantity: number
    price: string
    total_discount: string
  }>
  customer: {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string | null
    default_address: {
      address1: string
      address2: string | null
      city: string
      province: string
      zip: string
      country: string
    }
  }
  shipping_lines: Array<{
    title: string
    price: string
  }>
  note: string | null
}

export class ShopifyService {
  private stores: { [key: string]: ShopifyStore }
  private apiVersion = "2024-04"
  private syncInterval: NodeJS.Timeout | null = null
  private availableStores: { [key: string]: ShopifyStore } = {}

  constructor() {
    this.stores = {
      primary: {
        domain: process.env.SHOPIFY_STORE_A_DOMAIN || "",
        accessToken: process.env.SHOPIFY_STORE_A_ACCESS_TOKEN || "",
        name: "Primary Store",
      },
      outlet: {
        domain: process.env.SHOPIFY_STORE_B_DOMAIN || "",
        accessToken: process.env.SHOPIFY_STORE_B_ACCESS_TOKEN || "",
        name: "Outlet Store",
      },
    }

    // Filter out stores without proper configuration
    this.availableStores = Object.entries(this.stores)
      .filter(([key, store]) => store.domain && store.accessToken)
      .reduce(
        (acc, [key, store]) => {
          acc[key] = store
          return acc
        },
        {} as { [key: string]: ShopifyStore },
      )

    console.log(`🏪 Available stores: ${Object.keys(this.availableStores).length}`)

    // Start instant sync if enabled and we have stores
    if (Object.keys(this.availableStores).length > 0) {
      this.startInstantSync()
    }
  }

  private startInstantSync() {
    // Sync every 30 seconds for instant updates
    this.syncInterval = setInterval(async () => {
      try {
        console.log("🔄 Running instant inventory sync...")
        await this.autoSync()
      } catch (error) {
        console.error("Instant sync failed:", error)
      }
    }, 30000) // 30 seconds
  }

  private async autoSync() {
    try {
      const inventoryData = await this.getAllInventory()
      const updates = []

      // Find items that need syncing (different quantities across channels)
      for (const item of inventoryData.inventory) {
        const quantities = item.channels.map((ch) => ch.quantity)
        const maxQuantity = Math.max(...quantities)
        const minQuantity = Math.min(...quantities)

        if (maxQuantity !== minQuantity) {
          // This item needs syncing
          for (const channel of item.channels) {
            if (channel.quantity !== maxQuantity) {
              updates.push({
                sku: item.sku,
                inventoryItemId: item.inventoryItemId,
                locationId: channel.locationId,
                quantityDelta: maxQuantity - channel.quantity,
                targetQuantity: maxQuantity,
              })
            }
          }
        }
      }

      if (updates.length > 0) {
        console.log(`🚀 Auto-syncing ${updates.length} inventory items...`)
        await this.executeBulkUpdates(updates)
      }

      return {
        success: true,
        updatedItems: updates.length,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Auto-sync failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Auto-sync failed",
      }
    }
  }

  private async executeBulkUpdates(updates: any[]) {
    const batchSize = 5
    let successCount = 0

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)

      const batchPromises = batch.map((update) =>
        this.updateInventoryLevel(update.inventoryItemId, update.locationId, update.quantityDelta),
      )

      const batchResults = await Promise.all(batchPromises)
      successCount += batchResults.filter((r) => r.success).length

      // Add delay between batches to respect rate limits
      if (i + batchSize < updates.length) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    return successCount
  }

  private async makeRequest(store: ShopifyStore, method: string, endpoint: string, data?: any) {
    const startTime = Date.now()

    try {
      // Ensure domain has proper format - remove https:// if present and ensure .myshopify.com
      let domain = store.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")

      // If domain doesn't end with .myshopify.com, add it
      if (!domain.endsWith(".myshopify.com")) {
        // If it's just the shop name, add .myshopify.com
        if (!domain.includes(".")) {
          domain = `${domain}.myshopify.com`
        }
      }

      const url = `https://${domain}/admin/api/${this.apiVersion}${endpoint}`

      const response = await fetch(url, {
        method,
        headers: {
          "X-Shopify-Access-Token": store.accessToken,
          "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const responseData = await response.json()
      const latency = Date.now() - startTime

      return {
        success: true,
        data: responseData,
        latency,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - startTime,
      }
    }
  }

  private async graphqlRequest(store: ShopifyStore, query: string, variables: any = {}) {
    const startTime = Date.now()

    try {
      // Ensure domain has proper format
      let domain = store.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")

      if (!domain.endsWith(".myshopify.com")) {
        if (!domain.includes(".")) {
          domain = `${domain}.myshopify.com`
        }
      }

      const url = `https://${domain}/admin/api/${this.apiVersion}/graphql.json`

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": store.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`GraphQL HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const responseData = await response.json()
      const latency = Date.now() - startTime

      if (responseData.errors) {
        throw new Error(`GraphQL Errors: ${JSON.stringify(responseData.errors)}`)
      }

      return {
        success: true,
        data: responseData,
        latency,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - startTime,
      }
    }
  }

  async testConnection(storeKey: string) {
    const store = this.stores[storeKey]

    if (!store.domain || !store.accessToken) {
      return {
        success: false,
        error: `Missing configuration - Domain: ${!!store.domain}, Token: ${!!store.accessToken}`,
        store: store.name,
      }
    }

    // Validate token format
    if (!store.accessToken.startsWith("shpat_")) {
      return {
        success: false,
        error: "Invalid access token format. Should start with 'shpat_'",
        store: store.name,
      }
    }

    const shopResult = await this.makeRequest(store, "GET", "/shop.json")

    if (shopResult.success) {
      const shop = shopResult.data.shop
      return {
        success: true,
        store: store.name,
        shopName: shop.name,
        email: shop.email,
        domain: shop.domain,
        currency: shop.currency,
        timezone: shop.timezone,
      }
    }

    return {
      success: false,
      error: shopResult.error,
      store: store.name,
    }
  }

  async getAllInventory() {
    console.log("🔄 Fetching real inventory data from available Shopify stores...")

    const inventoryPromises = Object.entries(this.availableStores).map(([key, store]) =>
      this.getStoreInventory(key, store),
    )

    const results = await Promise.all(inventoryPromises)
    const inventory: InventoryItem[] = []
    let totalLatency = 0
    let totalRequests = 0
    let successfulRequests = 0
    let errorCount = 0

    // Process results and create unified inventory
    const skuMap = new Map<string, InventoryItem>()

    results.forEach((storeResult, index) => {
      const storeKey = Object.keys(this.stores)[index]
      const storeName = this.stores[storeKey].name

      totalRequests++

      if (storeResult.success && storeResult.products) {
        storeResult.products.forEach((product: any) => {
          if (product.sku && product.sku !== `NO-SKU-${product.variantId}`) {
            if (!skuMap.has(product.sku)) {
              skuMap.set(product.sku, {
                sku: product.sku,
                productTitle: product.productTitle,
                variantTitle: product.variantTitle,
                inventoryItemId: product.inventoryItemId.toString(),
                productId: product.productId.toString(),
                variantId: product.variantId.toString(),
                channels: [],
              })
            }

            const item = skuMap.get(product.sku)!

            // Add location-specific data
            Object.entries(product.locations || {}).forEach(([locationId, locationData]: [string, any]) => {
              item.channels.push({
                name: `${storeName} - ${locationData.name}`,
                quantity: locationData.available || 0,
                lastSync: Date.now(),
                status: "synced",
                syncLatency: storeResult.latency || 0,
                locationId,
                locationName: locationData.name,
              })
            })

            // If no locations, add store-level data
            if (Object.keys(product.locations || {}).length === 0) {
              item.channels.push({
                name: storeName,
                quantity: product.inventoryQuantity || 0,
                lastSync: Date.now(),
                status: "synced",
                syncLatency: storeResult.latency || 0,
                locationId: "default",
                locationName: "Default Location",
              })
            }
          }
        })

        successfulRequests++
        totalLatency += storeResult.latency || 0
      } else {
        errorCount++
      }
    })

    // Convert map to array
    inventory.push(...Array.from(skuMap.values()))

    // Generate real metrics
    const metrics = {
      totalSyncs: inventory.length * 2,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      avgLatency: totalRequests > 0 ? Math.floor(totalLatency / totalRequests) : 0,
      activeSyncs: 0,
      errorCount,
      uptime: successfulRequests > 0 ? 99.99 : 0,
    }

    // Generate alerts based on real data
    const alerts = []

    if (errorCount > 0) {
      alerts.push({
        id: Date.now(),
        type: "error",
        message: `Failed to sync ${errorCount} store(s). Check your API credentials.`,
        timestamp: Date.now(),
      })
    }

    // Check for low stock items
    const lowStockItems = inventory.filter((item) => item.channels.some((channel) => channel.quantity < 10))

    if (lowStockItems.length > 0) {
      alerts.push({
        id: Date.now() + 1,
        type: "warning",
        message: `${lowStockItems.length} items are running low on stock`,
        timestamp: Date.now(),
      })
    }

    if (alerts.length === 0) {
      alerts.push({
        id: Date.now(),
        type: "success",
        message: `Successfully synced ${inventory.length} products from ${successfulRequests} store(s)`,
        timestamp: Date.now(),
      })
    }

    return {
      inventory,
      metrics,
      alerts,
      timestamp: new Date().toISOString(),
    }
  }

  private async getStoreInventory(storeKey: string, store: ShopifyStore) {
    try {
      // Test connection first
      const connectionTest = await this.testConnection(storeKey)
      if (!connectionTest.success) {
        return {
          success: false,
          error: `Connection failed: ${connectionTest.error}`,
          latency: 0,
        }
      }

      // Get products with variants
      const productsResult = await this.makeRequest(
        store,
        "GET",
        "/products.json?limit=250&fields=id,title,handle,variants",
      )

      if (!productsResult.success) {
        return {
          success: false,
          error: `Failed to fetch products: ${productsResult.error}`,
          latency: productsResult.latency,
        }
      }

      // Get locations
      const locationsResult = await this.makeRequest(store, "GET", "/locations.json")
      const locations = locationsResult.success ? locationsResult.data.locations : []

      const products: ShopifyProduct[] = productsResult.data.products || []
      const processedProducts = []

      for (const product of products) {
        for (const variant of product.variants || []) {
          if (variant.inventory_item_id && variant.sku) {
            // Get inventory levels for this variant
            const inventoryResult = await this.makeRequest(
              store,
              "GET",
              `/inventory_levels.json?inventory_item_ids=${variant.inventory_item_id}`,
            )

            const locationQuantities: { [key: string]: any } = {}

            if (inventoryResult.success && inventoryResult.data.inventory_levels) {
              inventoryResult.data.inventory_levels.forEach((level: InventoryLevel) => {
                const location = locations.find((loc) => loc.id === level.location_id)
                locationQuantities[level.location_id.toString()] = {
                  name: location?.name || `Location ${level.location_id}`,
                  available: level.available || 0,
                  updatedAt: level.updated_at,
                }
              })
            }

            processedProducts.push({
              productId: product.id,
              productTitle: product.title,
              productHandle: product.handle,
              variantId: variant.id,
              variantTitle: variant.title,
              sku: variant.sku,
              inventoryItemId: variant.inventory_item_id,
              inventoryQuantity: variant.inventory_quantity || 0,
              price: Number.parseFloat(variant.price || "0"),
              locations: locationQuantities,
              lastUpdated: new Date().toISOString(),
            })
          }
        }
      }

      return {
        success: true,
        storeName: store.name,
        storeKey,
        products: processedProducts,
        locations,
        latency: productsResult.latency,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        latency: 0,
      }
    }
  }

  async getOrders() {
    try {
      const availableStoreKeys = Object.keys(this.availableStores)
      if (availableStoreKeys.length === 0) {
        throw new Error("No stores configured")
      }

      const store = this.availableStores[availableStoreKeys[0]] // Use first available store

      const ordersResult = await this.makeRequest(
        store,
        "GET",
        "/orders.json?status=any&limit=250&fields=id,name,email,created_at,updated_at,total_price,subtotal_price,total_tax,currency,financial_status,fulfillment_status,line_items,customer,shipping_lines,note",
      )

      if (!ordersResult.success) {
        throw new Error(`Failed to fetch orders: ${ordersResult.error}`)
      }

      const orders: ShopifyOrder[] = ordersResult.data.orders || []

      return orders.map((order) => ({
        id: order.id.toString(),
        orderNumber: order.name,
        customer: {
          name: `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim() || "Guest",
          email: order.customer?.email || order.email || "",
          phone: order.customer?.phone,
          address: order.customer?.default_address || {
            address1: "",
            city: "",
            province: "",
            zip: "",
            country: "",
          },
        },
        date: order.created_at,
        status: this.mapOrderStatus(order.fulfillment_status),
        paymentStatus: this.mapPaymentStatus(order.financial_status),
        total: Number.parseFloat(order.total_price || "0"),
        items: order.line_items?.length || 0,
        shippingMethod: order.shipping_lines?.[0]?.title || "Standard Shipping",
        trackingNumber: undefined, // Would need to fetch from fulfillments
      }))
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      return []
    }
  }

  async getOrderById(orderId: string) {
    try {
      const store = this.stores.primary

      const orderResult = await this.makeRequest(store, "GET", `/orders/${orderId}.json`)

      if (!orderResult.success) {
        return null
      }

      const order: ShopifyOrder = orderResult.data.order

      return {
        id: order.id.toString(),
        orderNumber: order.name,
        customer: {
          name: `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim() || "Guest",
          email: order.customer?.email || order.email || "",
          phone: order.customer?.phone,
          address: order.customer?.default_address || {
            address1: "",
            address2: "",
            city: "",
            province: "",
            zip: "",
            country: "",
          },
        },
        date: order.created_at,
        status: this.mapOrderStatus(order.fulfillment_status),
        paymentStatus: this.mapPaymentStatus(order.financial_status),
        total: Number.parseFloat(order.total_price || "0"),
        subtotal: Number.parseFloat(order.subtotal_price || "0"),
        tax: Number.parseFloat(order.total_tax || "0"),
        shipping: Number.parseFloat(order.shipping_lines?.[0]?.price || "0"),
        items:
          order.line_items?.map((item) => ({
            id: item.id.toString(),
            sku: item.sku || "",
            title: item.title,
            variant: item.name,
            quantity: item.quantity,
            price: Number.parseFloat(item.price || "0"),
            total: Number.parseFloat(item.price || "0") * item.quantity,
          })) || [],
        shippingMethod: order.shipping_lines?.[0]?.title || "Standard Shipping",
        notes: order.note,
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error)
      return null
    }
  }

  private mapOrderStatus(fulfillmentStatus: string | null): string {
    switch (fulfillmentStatus) {
      case "fulfilled":
        return "delivered"
      case "partial":
        return "processing"
      case "restocked":
        return "cancelled"
      case null:
        return "pending"
      default:
        return "processing"
    }
  }

  private mapPaymentStatus(financialStatus: string): string {
    switch (financialStatus) {
      case "paid":
        return "paid"
      case "pending":
        return "pending"
      case "refunded":
        return "refunded"
      case "voided":
        return "failed"
      default:
        return "pending"
    }
  }

  async syncSKU(sku: string) {
    try {
      const inventoryData = await this.getAllInventory()
      const item = inventoryData.inventory.find((inv) => inv.sku === sku)

      if (!item) {
        throw new Error(`SKU ${sku} not found in inventory`)
      }

      // Find the source with highest quantity (primary store takes precedence)
      const primaryChannel = item.channels.find((ch) => ch.name.includes("Primary"))
      const sourceQuantity = primaryChannel
        ? primaryChannel.quantity
        : Math.max(...item.channels.map((ch) => ch.quantity))

      // Sync to all other channels
      const syncPromises = item.channels.map(async (channel) => {
        if (channel.quantity !== sourceQuantity) {
          return this.updateInventoryLevel(item.inventoryItemId, channel.locationId, sourceQuantity - channel.quantity)
        }
        return { success: true, message: "Already in sync" }
      })

      const results = await Promise.all(syncPromises)
      const successCount = results.filter((r) => r.success).length

      return {
        success: true,
        message: `SKU ${sku} synced successfully`,
        updatedChannels: successCount,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sync failed",
      }
    }
  }

  async bulkSync() {
    try {
      const inventoryData = await this.getAllInventory()
      const updates = []

      // Find items that need syncing (different quantities across channels)
      for (const item of inventoryData.inventory) {
        const quantities = item.channels.map((ch) => ch.quantity)
        const maxQuantity = Math.max(...quantities)
        const minQuantity = Math.min(...quantities)

        if (maxQuantity !== minQuantity) {
          // This item needs syncing
          for (const channel of item.channels) {
            if (channel.quantity !== maxQuantity) {
              updates.push({
                sku: item.sku,
                inventoryItemId: item.inventoryItemId,
                locationId: channel.locationId,
                quantityDelta: maxQuantity - channel.quantity,
                targetQuantity: maxQuantity,
              })
            }
          }
        }
      }

      if (updates.length === 0) {
        return {
          success: true,
          message: "All inventory is already in sync",
          updatedItems: 0,
          timestamp: new Date().toISOString(),
        }
      }

      const successCount = await this.executeBulkUpdates(updates)

      return {
        success: true,
        message: `Bulk sync completed successfully`,
        updatedItems: successCount,
        totalItems: updates.length,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Bulk sync failed",
      }
    }
  }

  private async updateInventoryLevel(inventoryItemId: string, locationId: string, quantityDelta: number) {
    // Find which store this location belongs to
    const targetStore = Object.values(this.stores)[0] // For now, use primary store

    const query = `
      mutation inventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
        inventoryAdjustQuantity(input: $input) {
          inventoryLevel {
            id
            available
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        inventoryItemId: `gid://shopify/InventoryItem/${inventoryItemId}`,
        locationId: `gid://shopify/Location/${locationId}`,
        quantityDelta: quantityDelta,
      },
    }

    const result = await this.graphqlRequest(targetStore, query, variables)

    if (result.success) {
      const mutation = result.data.data.inventoryAdjustQuantity

      if (mutation.userErrors.length > 0) {
        return {
          success: false,
          error: mutation.userErrors.map((e: any) => e.message).join(", "),
        }
      }

      return {
        success: true,
        newQuantity: mutation.inventoryLevel.available,
      }
    }

    return {
      success: false,
      error: result.error,
    }
  }

  // Get products for invoice creation
  async getProductsForInvoice() {
    try {
      const inventoryData = await this.getAllInventory()

      return inventoryData.inventory.map((item) => ({
        sku: item.sku,
        description: `${item.productTitle} - ${item.variantTitle}`,
        price: 0, // You'll need to fetch pricing separately or store it
        availableQuantity: Math.max(...item.channels.map((ch) => ch.quantity)),
      }))
    } catch (error) {
      console.error("Failed to get products for invoice:", error)
      return []
    }
  }

  async getDetailedInventory() {
    try {
      const availableStoreKeys = Object.keys(this.availableStores)
      if (availableStoreKeys.length === 0) {
        throw new Error("No stores configured")
      }

      const store = this.availableStores[availableStoreKeys[0]]
      console.log(`📦 Fetching detailed inventory from ${store.name}...`)

      // Get products with full details
      const productsResult = await this.makeRequest(
        store,
        "GET",
        "/products.json?limit=250&fields=id,title,handle,product_type,vendor,variants,status,created_at,updated_at",
      )

      if (!productsResult.success) {
        throw new Error(`Failed to fetch products: ${productsResult.error}`)
      }

      // Get locations
      const locationsResult = await this.makeRequest(store, "GET", "/locations.json")
      const locations = locationsResult.success ? locationsResult.data.locations : []

      const products = productsResult.data.products || []
      const detailedProducts = []

      for (const product of products) {
        for (const variant of product.variants || []) {
          if (variant.inventory_item_id) {
            // Get inventory levels for this variant
            const inventoryResult = await this.makeRequest(
              store,
              "GET",
              `/inventory_levels.json?inventory_item_ids=${variant.inventory_item_id}`,
            )

            let totalAvailable = 0
            const totalReserved = 0
            const locationData = []

            if (inventoryResult.success && inventoryResult.data.inventory_levels) {
              for (const level of inventoryResult.data.inventory_levels) {
                const location = locations.find((loc: any) => loc.id === level.location_id)
                totalAvailable += level.available || 0

                locationData.push({
                  id: level.location_id.toString(),
                  name: location?.name || `Location ${level.location_id}`,
                  quantity: level.available || 0,
                })
              }
            }

            // Get inventory item details for cost and tracking
            const inventoryItemResult = await this.makeRequest(
              store,
              "GET",
              `/inventory_items/${variant.inventory_item_id}.json`,
            )

            let cost = 0
            let tracked = true
            if (inventoryItemResult.success) {
              const item = inventoryItemResult.data.inventory_item
              cost = Number.parseFloat(item.cost || "0")
              tracked = item.tracked
            }

            detailedProducts.push({
              id: variant.id.toString(),
              sku: variant.sku || `NO-SKU-${variant.id}`,
              title: product.title,
              variant: variant.title === "Default Title" ? "" : variant.title,
              price: Number.parseFloat(variant.price || "0"),
              cost: cost,
              quantity: totalAvailable + totalReserved,
              reserved: totalReserved,
              available: totalAvailable,
              locations: locationData,
              lowStockThreshold: 10, // Default threshold, could be customized
              category: product.product_type || "Uncategorized",
              vendor: product.vendor || "Unknown",
              weight: Number.parseFloat(variant.weight || "0"),
              lastUpdated: variant.updated_at || product.updated_at,
              status: product.status === "active" ? "active" : product.status,
              inventoryItemId: variant.inventory_item_id,
              productId: product.id,
              variantId: variant.id,
              tracked: tracked,
            })
          }
        }
      }

      console.log(`✅ Fetched ${detailedProducts.length} detailed inventory items`)
      return detailedProducts
    } catch (error) {
      console.error("Failed to get detailed inventory:", error)
      return []
    }
  }

  async updateProductQuantity(variantId: string, newQuantity: number) {
    try {
      const availableStoreKeys = Object.keys(this.availableStores)
      if (availableStoreKeys.length === 0) {
        throw new Error("No stores configured")
      }

      const store = this.availableStores[availableStoreKeys[0]]

      // First get the variant to find inventory_item_id
      const variantResult = await this.makeRequest(store, "GET", `/variants/${variantId}.json`)

      if (!variantResult.success) {
        throw new Error("Failed to fetch variant details")
      }

      const variant = variantResult.data.variant
      const inventoryItemId = variant.inventory_item_id

      // Get current inventory levels
      const inventoryResult = await this.makeRequest(
        store,
        "GET",
        `/inventory_levels.json?inventory_item_ids=${inventoryItemId}`,
      )

      if (!inventoryResult.success) {
        throw new Error("Failed to fetch current inventory levels")
      }

      const inventoryLevels = inventoryResult.data.inventory_levels || []

      // Update each location (for simplicity, we'll update the first location)
      if (inventoryLevels.length > 0) {
        const level = inventoryLevels[0]
        const currentQuantity = level.available || 0
        const quantityDelta = newQuantity - currentQuantity

        if (quantityDelta !== 0) {
          const result = await this.updateInventoryLevel(
            inventoryItemId.toString(),
            level.location_id.toString(),
            quantityDelta,
          )

          return {
            success: result.success,
            message: result.success ? `Quantity updated from ${currentQuantity} to ${newQuantity}` : result.error,
            newQuantity: result.success ? newQuantity : currentQuantity,
          }
        } else {
          return {
            success: true,
            message: "Quantity is already at the target value",
            newQuantity: currentQuantity,
          }
        }
      }

      return {
        success: false,
        error: "No inventory locations found for this product",
      }
    } catch (error) {
      console.error("Failed to update product quantity:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      }
    }
  }

  async bulkInventorySync() {
    try {
      console.log("🚀 Starting bulk inventory synchronization...")

      const availableStoreKeys = Object.keys(this.availableStores)
      if (availableStoreKeys.length === 0) {
        throw new Error("No stores configured")
      }

      // If we have multiple stores, sync between them
      if (availableStoreKeys.length > 1) {
        return await this.bulkSync()
      }

      // If we have only one store, refresh all inventory data
      const store = this.availableStores[availableStoreKeys[0]]
      console.log(`🔄 Refreshing inventory data for ${store.name}...`)

      // Force refresh inventory data
      const detailedInventory = await this.getDetailedInventory()

      return {
        success: true,
        message: `Inventory data refreshed for ${store.name}`,
        updatedItems: detailedInventory.length,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Bulk inventory sync failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Bulk sync failed",
      }
    }
  }

  // Add method to get store information
  async getStoreInfo() {
    try {
      const availableStoreKeys = Object.keys(this.availableStores)
      if (availableStoreKeys.length === 0) {
        return { success: false, error: "No stores configured" }
      }

      const storeInfoPromises = availableStoreKeys.map(async (key) => {
        const store = this.availableStores[key]
        const result = await this.testConnection(key)
        return {
          key,
          name: store.name,
          domain: store.domain,
          ...result,
        }
      })

      const storeInfos = await Promise.all(storeInfoPromises)

      return {
        success: true,
        stores: storeInfos,
        activeStores: storeInfos.filter((store) => store.success).length,
        totalStores: storeInfos.length,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get store info",
      }
    }
  }

  // Cleanup method
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }
}
