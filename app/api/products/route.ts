import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function GET() {
  try {
    const shopifyService = new ShopifyService()
    const products = await shopifyService.getProductsForInvoice()

    return NextResponse.json(products)
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
