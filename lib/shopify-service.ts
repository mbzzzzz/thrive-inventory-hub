class ShopifyService {
  async getStoreInfo() {
    const stores = []
    let activeStores = 0
    const totalStores = 2 // We have 2 potential stores

    // Check Store 1
    if (process.env.SHOPIFY_STORE_DOMAIN_1 && process.env.SHOPIFY_ACCESS_TOKEN_1) {
      try {
        const response = await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN_1}/admin/api/2023-10/shop.json`, {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN_1,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          stores.push({
            key: "store1",
            name: "Store 1",
            domain: process.env.SHOPIFY_STORE_DOMAIN_1,
            success: true,
            shopName: data.shop?.name || "Store 1",
          })
          activeStores++
        } else {
          stores.push({
            key: "store1",
            name: "Store 1",
            domain: process.env.SHOPIFY_STORE_DOMAIN_1,
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
          })
        }
      } catch (error) {
        stores.push({
          key: "store1",
          name: "Store 1",
          domain: process.env.SHOPIFY_STORE_DOMAIN_1,
          success: false,
          error: error instanceof Error ? error.message : "Connection failed",
        })
      }
    }

    // Check Store 2
    if (process.env.SHOPIFY_STORE_DOMAIN_2 && process.env.SHOPIFY_ACCESS_TOKEN_2) {
      try {
        const response = await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN_2}/admin/api/2023-10/shop.json`, {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN_2,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          stores.push({
            key: "store2",
            name: "Store 2",
            domain: process.env.SHOPIFY_STORE_DOMAIN_2,
            success: true,
            shopName: data.shop?.name || "Store 2",
          })
          activeStores++
        } else {
          stores.push({
            key: "store2",
            name: "Store 2",
            domain: process.env.SHOPIFY_STORE_DOMAIN_2,
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
          })
        }
      } catch (error) {
        stores.push({
          key: "store2",
          name: "Store 2",
          domain: process.env.SHOPIFY_STORE_DOMAIN_2,
          success: false,
          error: error instanceof Error ? error.message : "Connection failed",
        })
      }
    }

    return {
      stores,
      activeStores,
      totalStores: stores.length,
    }
  }
}
