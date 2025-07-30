import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function POST() {
  try {
    const shopifyService = new ShopifyService()
    const result = await shopifyService.bulkSync()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Bulk sync API error:", error)
    return NextResponse.json({ error: "Bulk sync failed" }, { status: 500 })
  }
}
