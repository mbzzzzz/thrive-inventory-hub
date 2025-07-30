import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function GET() {
  try {
    const shopifyService = new ShopifyService()
    const detailedInventory = await shopifyService.getDetailedInventory()

    return NextResponse.json({
      success: true,
      products: detailedInventory,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Detailed inventory API error:", error)
    return NextResponse.json({ error: "Failed to fetch detailed inventory" }, { status: 500 })
  }
}
