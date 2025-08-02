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
    const metrics = await shopifyService.getPerformanceMetrics()
    return NextResponse.json({ success: true, data: metrics })
  } catch (error: any) {
    console.error("Error fetching performance metrics:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch performance metrics" },
      { status: 500 },
    )
  }
}
