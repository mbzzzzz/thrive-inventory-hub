import { SHOPIFY_API_VERSION } from "./env"

interface ShopifyProduct {
  id: string
  title: string
  handle: string
  status: string
  variants: Array<{
    id: string
    title: string
    sku: string
    inventory_quantity: number
    price: string
  }>
  image?: {
    src: string
  }
}

interface ShopifyOrder {
  id: string
  name: string // Order name, e.g., "#1001"
  email: string
  created_at: string
  total_price: string
  financial_status: string
  fulfillment_status: string | null
  line_items: Array<{
    id: string
    title: string
    quantity: number
    price: string
    sku: string
  }>
  customer: {
    first_name: string
    last_name: string
    email: string
  } | null // Allow customer to be null
  shipping_address?: {
    address1: string
    city: string
    province: string
    zip: string
    country: string
  }
}

export class ShopifyService {
  private domain: string
  private accessToken: string
  private apiVersion: string

  constructor(domain: string, accessToken: string) {
    this.domain = domain.replace(/(^\w+:|^)\/\//, "") // Remove http(s)://
    this.accessToken = accessToken
    this.apiVersion = SHOPIFY_API_VERSION || "2024-04"
  }

  private getHeaders() {
    return {
      "X-Shopify-Access-Token": this.accessToken,
      "Content-Type": "application/json",
    }
  }

  private getUrl(path: string) {
    return `https://${this.domain}/admin/api/${this.apiVersion}${path}`
  }

  async testConnection(): Promise<{ success: boolean; shopName?: string; error?: string }> {
    try {
      const response = await fetch(this.getUrl("/shop.json"), {
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.errors || response.statusText }
      }

      const data = await response.json()
      return { success: true, shopName: data.shop.name }
    } catch (error: any) {
      console.error("Shopify connection test failed:", error)
      return { success: false, error: error.message || "Network error or invalid credentials." }
    }
  }

  async getAllInventory(): Promise<ShopifyProduct[]> {
    try {
      const response = await fetch(this.getUrl("/products.json?fields=id,title,handle,status,variants,image"), {
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors || "Failed to fetch products")
      }

      const data = await response.json()
      return data.products
    } catch (error) {
      console.error("Error fetching all inventory:", error)
      throw error
    }
  }

  async getDetailedInventory(): Promise<any[]> {
    try {
      const response = await fetch(this.getUrl("/products.json?fields=id,title,variants"), {
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors || "Failed to fetch detailed inventory")
      }

      const data = await response.json()
      const products = data.products

      // For detailed inventory, we might want to fetch inventory levels separately
      // This is a simplified example. In a real app, you'd use GraphQL or more specific REST endpoints.
      const detailedProducts = await Promise.all(
        products.map(async (product: any) => {
          const variantsWithInventory = await Promise.all(
            product.variants.map(async (variant: any) => {
              // This is a simplified approach. For accurate inventory,
              // you'd typically query inventory_levels.json or use GraphQL.
              // For now, we'll use the quantity directly from the product variant.
              return {
                ...variant,
                inventory_quantity: variant.inventory_quantity, // Assuming this is available
              }
            }),
          )
          return { ...product, variants: variantsWithInventory }
        }),
      )

      return detailedProducts
    } catch (error) {
      console.error("Error fetching detailed inventory:", error)
      throw error
    }
  }

  async updateProductQuantity(variantId: string, newQuantity: number): Promise<{ success: boolean; message?: string }> {
    try {
      // To update inventory, you typically need the inventory_item_id and location_id
      // This example assumes a simplified direct update via product variant, which might not be
      // the most robust way for all Shopify setups.
      // A more robust solution would involve fetching inventory levels and then updating.

      // First, get the product variant to find its inventory_item_id
      const variantResponse = await fetch(this.getUrl(`/variants/${variantId}.json`), {
        headers: this.getHeaders(),
      })
      if (!variantResponse.ok) {
        const errorData = await variantResponse.json()
        throw new Error(errorData.errors || "Failed to fetch variant for update")
      }
      const variantData = await variantResponse.json()
      const inventoryItemId = variantData.variant.inventory_item_id

      // Assuming a single location for simplicity. In a real app, you'd manage locations.
      const locationsResponse = await fetch(this.getUrl("/locations.json"), {
        headers: this.getHeaders(),
      })
      if (!locationsResponse.ok) {
        const errorData = await locationsResponse.json()
        throw new Error(errorData.errors || "Failed to fetch locations")
      }
      const locationsData = await locationsResponse.json()
      const locationId = locationsData.locations[0]?.id // Use the first location

      if (!inventoryItemId || !locationId) {
        throw new Error("Could not find inventory item ID or location ID for update.")
      }

      const updateResponse = await fetch(this.getUrl("/inventory_levels/set.json"), {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          inventory_item_id: inventoryItemId,
          location_id: locationId,
          available: newQuantity,
        }),
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        throw new Error(errorData.errors || "Failed to update inventory quantity")
      }

      return { success: true, message: `Quantity for variant ${variantId} updated to ${newQuantity}` }
    } catch (error: any) {
      console.error("Error updating product quantity:", error)
      return { success: false, message: error.message || "Failed to update product quantity" }
    }
  }

  async syncSKU(sku: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This is a placeholder for a more complex sync logic.
      // In a real scenario, you'd fetch the product by SKU and update its inventory.
      console.log(`Simulating sync for SKU: ${sku}`)
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
      return { success: true }
    } catch (error: any) {
      console.error("Error syncing SKU:", error)
      return { success: false, error: error.message || "Failed to sync SKU" }
    }
  }

  async bulkSync(): Promise<{ success: boolean; error?: string }> {
    try {
      // This is a placeholder for a more complex bulk sync logic.
      // In a real scenario, you'd fetch all products and update their inventory.
      console.log("Simulating bulk sync...")
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
      return { success: true }
    } catch (error: any) {
      console.error("Error during bulk sync:", error)
      return { success: false, error: error.message || "Failed to perform bulk sync" }
    }
  }

  async bulkInventorySync(): Promise<{ success: boolean; error?: string }> {
    try {
      // This is a placeholder for a more complex bulk inventory sync logic.
      // In a real scenario, you'd fetch all inventory levels and update them.
      console.log("Simulating bulk inventory sync...")
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
      return { success: true }
    } catch (error: any) {
      console.error("Error during bulk inventory sync:", error)
      return { success: false, error: error.message || "Failed to perform bulk inventory sync" }
    }
  }

  async getProductsForInvoice(): Promise<ShopifyProduct[]> {
    try {
      const response = await fetch(this.getUrl("/products.json?fields=id,title,variants"), {
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors || "Failed to fetch products for invoice")
      }

      const data = await response.json()
      return data.products
    } catch (error) {
      console.error("Error fetching products for invoice:", error)
      throw error
    }
  }

  async getOrders(): Promise<ShopifyOrder[]> {
    try {
      const response = await fetch(
        this.getUrl(
          "/orders.json?status=any&fields=id,name,email,created_at,total_price,financial_status,fulfillment_status,line_items,customer,shipping_address",
        ),
        {
          headers: this.getHeaders(),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors || "Failed to fetch orders")
      }

      const data = await response.json()
      return data.orders
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw error
    }
  }

  async getOrderById(id: string): Promise<ShopifyOrder | null> {
    try {
      const response = await fetch(this.getUrl(`/orders/${id}.json`), {
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        const errorData = await response.json()
        throw new Error(errorData.errors || "Failed to fetch order by ID")
      }

      const data = await response.json()
      return data.order
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error)
      throw error
    }
  }

  async getPerformanceMetrics(): Promise<{
    totalSales: number
    totalOrders: number
    averageOrderValue: number
    topSellingProducts: Array<{ title: string; sales: number }>
    itemsNeedingRestock: Array<{ title: string; sku: string; currentStock: number }>
  }> {
    // This is a simplified mock. In a real application, you'd fetch actual sales data,
    // aggregate it, and determine top products and low stock items.
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

    const mockProducts = await this.getAllInventory()
    const mockOrders = await this.getOrders()

    let totalSales = 0
    const totalOrders = mockOrders.length
    const productSales: { [key: string]: number } = {}
    const productStock: { [key: string]: { title: string; sku: string; currentStock: number } } = {}

    mockOrders.forEach((order) => {
      totalSales += Number.parseFloat(order.total_price)
      order.line_items.forEach((item) => {
        productSales[item.title] = (productSales[item.title] || 0) + Number.parseFloat(item.price) * item.quantity
      })
    })

    mockProducts.forEach((product) => {
      product.variants.forEach((variant) => {
        if (variant.inventory_quantity < 10) {
          // Threshold for restock
          productStock[variant.sku] = {
            title: product.title,
            sku: variant.sku,
            currentStock: variant.inventory_quantity,
          }
        }
      })
    })

    const topSellingProducts = Object.entries(productSales)
      .sort(([, salesA], [, salesB]) => salesB - salesA)
      .slice(0, 5)
      .map(([title, sales]) => ({ title, sales }))

    const itemsNeedingRestock = Object.values(productStock)

    return {
      totalSales: Number.parseFloat(totalSales.toFixed(2)),
      totalOrders,
      averageOrderValue: totalOrders > 0 ? Number.parseFloat((totalSales / totalOrders).toFixed(2)) : 0,
      topSellingProducts,
      itemsNeedingRestock,
    }
  }
}
