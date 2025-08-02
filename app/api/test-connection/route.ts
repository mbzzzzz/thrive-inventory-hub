import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function POST(request: Request) {
  try {
    const { domain, accessToken } = await request.json()

    if (!domain || !accessToken) {
      return NextResponse.json({ success: false, error: "Domain and access token are required." }, { status: 400 })
    }

    const shopifyService = new ShopifyService(domain, accessToken)
    const result = await shopifyService.testConnection()

    if (result.success) {
      return NextResponse.json({ success: true, shopName: result.shopName })
    } else {
      return NextResponse.json({ success: false, error: result.error || "Connection failed." }, { status: 401 })
    }
  } catch (error: any) {
    console.error("API Error testing connection:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred." },
      { status: 500 },
    )
  }
}
