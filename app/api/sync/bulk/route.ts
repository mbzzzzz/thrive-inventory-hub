import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function POST(request: Request) {
  const shopifyDomain = request.headers.get("X-Shopify-Domain")
  const shopifyAccessToken = request.headers.get("X-Shopify-Access-Token")

  if (!shopifyDomain || !shopifyAccessToken) {
    return NextResponse.json({ success: false, error: "Shopify credentials not provided in headers." }, { status: 401 })
  }

  try {
    const shopifyService = new ShopifyService(shopifyDomain, shopifyAccessToken)
    const result = await shopifyService.bulkSync()

    if (result.success) {
      return NextResponse.json({ success: true, message: "Bulk sync initiated successfully." })
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to initiate bulk sync." },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error during bulk sync:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to perform bulk sync." },
      { status: 500 },
    )
  }
}
