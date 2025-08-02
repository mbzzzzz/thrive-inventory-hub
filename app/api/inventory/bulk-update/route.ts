import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function POST(request: Request) {
  const shopifyDomain = request.headers.get("X-Shopify-Domain")
  const shopifyAccessToken = request.headers.get("X-Shopify-Access-Token")

  if (!shopifyDomain || !shopifyAccessToken) {
    return NextResponse.json({ success: false, error: "Shopify credentials not provided in headers." }, { status: 401 })
  }

  try {
    const { updates } = await request.json() // Expects an array of { variantId, newQuantity }

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "Updates array is required and cannot be empty." },
        { status: 400 },
      )
    }

    const shopifyService = new ShopifyService(shopifyDomain, shopifyAccessToken)
    const results = await Promise.all(
      updates.map((update: { variantId: string; newQuantity: number }) =>
        shopifyService.updateProductQuantity(update.variantId, update.newQuantity),
      ),
    )

    const allSuccess = results.every((r) => r.success)
    const messages = results.map((r) => r.message).join("; ")

    if (allSuccess) {
      return NextResponse.json({ success: true, message: "Bulk inventory update completed successfully." })
    } else {
      return NextResponse.json(
        { success: false, error: messages || "Some updates failed during bulk inventory update." },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error during bulk inventory update:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to perform bulk inventory update." },
      { status: 500 },
    )
  }
}
