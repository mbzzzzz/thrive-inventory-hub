import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function POST(request: Request) {
  try {
    const { domain, accessToken } = await request.json()

    if (!domain || !accessToken) {
      return NextResponse.json(
        { success: false, error: "Shopify domain and access token are required." },
        { status: 400 },
      )
    }

    const shopifyService = new ShopifyService(domain, accessToken)
    const connectionResult = await shopifyService.testConnection()

    if (connectionResult.success) {
      return NextResponse.json({ success: true, message: `Successfully connected to ${connectionResult.shopName}.` })
    } else {
      return NextResponse.json(
        { success: false, error: connectionResult.error || "Failed to connect to Shopify." },
        { status: 401 },
      )
    }
  } catch (error: any) {
    console.error("Error in /api/stores/connect:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
