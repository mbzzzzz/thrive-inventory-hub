import { NextResponse } from "next/server"
import { ShopifyService } from "@/lib/shopify-service"

export async function GET() {
  try {
    const shopifyService = new ShopifyService()

    // Check environment variables
    const envCheck = {
      SHOPIFY_STORE_A_DOMAIN: !!process.env.SHOPIFY_STORE_A_DOMAIN,
      SHOPIFY_STORE_A_ACCESS_TOKEN: !!process.env.SHOPIFY_STORE_A_ACCESS_TOKEN,
      SHOPIFY_STORE_B_DOMAIN: !!process.env.SHOPIFY_STORE_B_DOMAIN,
      SHOPIFY_STORE_B_ACCESS_TOKEN: !!process.env.SHOPIFY_STORE_B_ACCESS_TOKEN,
    }

    console.log("🔍 Environment Variables Check:", envCheck)

    // Test both store connections
    const [primaryTest, outletTest] = await Promise.all([
      shopifyService.testConnection("primary"),
      shopifyService.testConnection("outlet"),
    ])

    return NextResponse.json({
      success: true,
      environment: envCheck,
      stores: {
        primary: primaryTest,
        outlet: outletTest,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Connection test failed",
        environment: {
          SHOPIFY_STORE_A_DOMAIN: !!process.env.SHOPIFY_STORE_A_DOMAIN,
          SHOPIFY_STORE_A_ACCESS_TOKEN: !!process.env.SHOPIFY_STORE_A_ACCESS_TOKEN,
          SHOPIFY_STORE_B_DOMAIN: !!process.env.SHOPIFY_STORE_B_DOMAIN,
          SHOPIFY_STORE_B_ACCESS_TOKEN: !!process.env.SHOPIFY_STORE_B_ACCESS_TOKEN,
        },
      },
      { status: 500 },
    )
  }
}
