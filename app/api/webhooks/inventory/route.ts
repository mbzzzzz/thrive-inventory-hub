import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const hmacHeader = headersList.get("x-shopify-hmac-sha256")
    const topic = headersList.get("x-shopify-topic")

    // Verify webhook authenticity
    if (!verifyWebhook(body, hmacHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const inventoryData = JSON.parse(body)

    console.log(`📦 Received inventory webhook: ${topic}`, {
      inventoryItemId: inventoryData.inventory_item_id,
      locationId: inventoryData.location_id,
      available: inventoryData.available,
    })

    // Here you could trigger a sync to other stores
    // or update your local cache/database

    // For now, just log the update
    console.log("Inventory update processed successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook processing failed:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

function verifyWebhook(body: string, hmacHeader: string | null): boolean {
  if (!hmacHeader || !process.env.SHOPIFY_WEBHOOK_SECRET) {
    return false
  }

  const calculatedHmac = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(body, "utf8")
    .digest("base64")

  return calculatedHmac === hmacHeader
}
