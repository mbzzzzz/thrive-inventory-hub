import { NextResponse } from "next/server"
import { generateInvoicePdf } from "@/lib/invoice-generator"
import { ShopifyService } from "@/lib/shopify-service"

export async function POST(request: Request) {
  const shopifyDomain = request.headers.get("X-Shopify-Domain")
  const shopifyAccessToken = request.headers.get("X-Shopify-Access-Token")

  if (!shopifyDomain || !shopifyAccessToken) {
    return NextResponse.json({ success: false, error: "Shopify credentials not provided in headers." }, { status: 401 })
  }

  try {
    const { orderId, branding } = await request.json()

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required to generate invoice." }, { status: 400 })
    }

    const shopifyService = new ShopifyService(shopifyDomain, shopifyAccessToken)
    const order = await shopifyService.getOrderById(orderId)

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found for invoice generation." }, { status: 404 })
    }

    const pdfBuffer = await generateInvoicePdf(order, branding)

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order.name}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error("API Error generating invoice PDF:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate invoice PDF." },
      { status: 500 },
    )
  }
}
