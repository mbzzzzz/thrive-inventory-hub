import { type NextRequest, NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity } = await request.json()

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: "Product ID and quantity are required" }, { status: 400 })
    }

    const shopifyService = new ShopifyService()
    const result = await shopifyService.updateProductQuantity(productId, quantity)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Update inventory API error:", error)
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 })
  }
}
