import { type NextRequest, NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const shopifyService = new ShopifyService()
    const order = await shopifyService.getOrderById(params.id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Order details API error:", error)
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 })
  }
}
