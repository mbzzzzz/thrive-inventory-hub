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
    const inventory = await shopifyService.getAllInventory()
    return NextResponse.json({ success: true, data: inventory })
  } catch (error: any) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch inventory" }, { status: 500 })
  }
}
