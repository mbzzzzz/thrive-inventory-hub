import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function GET() {
  try {
    const shopifyService = new ShopifyService()
    const storeInfo = await shopifyService.getStoreInfo()

    // Ensure we always return the expected structure
    const response = {
      stores: storeInfo?.stores || [],
      activeStores: storeInfo?.activeStores || 0,
      totalStores: storeInfo?.totalStores || 0,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Store info API error:", error)

    // Return a safe fallback structure
    return NextResponse.json(
      {
        stores: [],
        activeStores: 0,
        totalStores: 0,
        error: "Failed to fetch store info",
      },
      { status: 500 },
    )
  }
}
