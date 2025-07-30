import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function GET() {
  try {
    const shopifyService = new ShopifyService()
    const orders = await shopifyService.getOrders()

    return NextResponse.json({
      success: true,
      orders,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Orders API error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
