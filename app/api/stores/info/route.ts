import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function GET() {
  try {
    const shopifyService = new ShopifyService()
    const storeInfo = await shopifyService.getStoreInfo()

    return NextResponse.json(storeInfo)
  } catch (error) {
    console.error("Store info API error:", error)
    return NextResponse.json({ error: "Failed to fetch store info" }, { status: 500 })
  }
}
