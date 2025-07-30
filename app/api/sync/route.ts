import { type NextRequest, NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function POST(request: NextRequest) {
  try {
    const { sku } = await request.json()

    if (!sku) {
      return NextResponse.json({ error: "SKU is required" }, { status: 400 })
    }

    const shopifyService = new ShopifyService()
    const result = await shopifyService.syncSKU(sku)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Sync API error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
