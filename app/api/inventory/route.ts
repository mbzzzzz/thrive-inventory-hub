import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function GET() {
  try {
    const shopifyService = new ShopifyService()
    const inventoryData = await shopifyService.getAllInventory()

    return NextResponse.json(inventoryData)
  } catch (error) {
    console.error("Inventory API error:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}
