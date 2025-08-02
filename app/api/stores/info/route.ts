import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function GET(request: Request) {
  const shopifyDomain = request.headers.get("X-Shopify-Domain")
  const shopifyAccessToken = request.headers.get("X-Shopify-Access-Token")

  if (!shopifyDomain || !shopifyAccessToken) {
    return NextResponse.json({ success: false, error: "Shopify credentials not provided in headers." }, { status: 401 })
  }

  try {
    const shopifyService = new ShopifyService(shopifyDomain, shopifyAccessToken)
    const shopInfo = await shopifyService.testConnection() // Reusing testConnection to get shop name

    if (shopInfo.success) {
      return NextResponse.json({ success: true, shopName: shopInfo.shopName })
    } else {
      return NextResponse.json(
        { success: false, error: shopInfo.error || "Failed to fetch store info." },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error fetching store info:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch store info." }, { status: 500 })
  }
}
