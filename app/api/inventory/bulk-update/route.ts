import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function POST() {
  try {
    const shopifyService = new ShopifyService()
    const result = await shopifyService.bulkInventorySync()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Bulk update API error:", error)
    return NextResponse.json({ error: "Bulk update failed" }, { status: 500 })
  }
}
