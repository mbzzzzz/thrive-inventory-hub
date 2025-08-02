import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function POST(request: Request) {
  const shopifyDomain = request.headers.get("X-Shopify-Domain")
  const shopifyAccessToken = request.headers.get("X-Shopify-Access-Token")

  if (!shopifyDomain || !shopifyAccessToken) {
    return NextResponse.json({ success: false, error: "Shopify credentials not provided in headers." }, { status: 401 })
  }

  try {
    const { variantId, newQuantity } = await request.json()

    if (!variantId || typeof newQuantity !== "number") {
      return NextResponse.json({ success: false, error: "Variant ID and new quantity are required." }, { status: 400 })
    }

    const shopifyService = new ShopifyService(shopifyDomain, shopifyAccessToken)
    const result = await shopifyService.updateProductQuantity(variantId, newQuantity)

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message })
    } else {
      return NextResponse.json(
        { success: false, error: result.message || "Failed to update inventory." },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error updating inventory:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to update inventory." }, { status: 500 })
  }
}
