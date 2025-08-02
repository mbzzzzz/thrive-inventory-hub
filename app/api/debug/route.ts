import { NextResponse } from "next/server"
import { headers } from "next/headers"
import {
  SHOPIFY_STORE_DOMAIN_1,
  SHOPIFY_ACCESS_TOKEN_1,
  SHOPIFY_STORE_DOMAIN_2,
  SHOPIFY_ACCESS_TOKEN_2,
  RESEND_API_KEY,
} from "@/lib/env"

export async function GET(request: Request) {
  const requestHeaders = headers()

  const debugInfo = {
    timestamp: new Date().toISOString(),
    requestUrl: request.url,
    requestMethod: request.method,
    requestHeaders: Object.fromEntries(requestHeaders.entries()),
    environmentVariables: {
      SHOPIFY_STORE_DOMAIN_1: SHOPIFY_STORE_DOMAIN_1 ? "Configured" : "Not Configured",
      SHOPIFY_ACCESS_TOKEN_1: SHOPIFY_ACCESS_TOKEN_1 ? "Configured" : "Not Configured",
      SHOPIFY_STORE_DOMAIN_2: SHOPIFY_STORE_DOMAIN_2 ? "Configured" : "Not Configured",
      SHOPIFY_ACCESS_TOKEN_2: SHOPIFY_ACCESS_TOKEN_2 ? "Configured" : "Not Configured",
      RESEND_API_KEY: RESEND_API_KEY ? "Configured" : "Not Configured",
      // Add other relevant environment variables you want to debug
    },
    // You can add more debug information here, e.g., session data, query params
  }

  return NextResponse.json(debugInfo, { status: 200 })
}
