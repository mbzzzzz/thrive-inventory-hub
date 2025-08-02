import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  SHOPIFY_STORE_DOMAIN_1,
  SHOPIFY_ACCESS_TOKEN_1,
  SHOPIFY_STORE_DOMAIN_2,
  SHOPIFY_ACCESS_TOKEN_2,
} from "./lib/env"

export function middleware(request: NextRequest) {
  const activeStoreKey = request.headers.get("X-Shopify-Active-Store-Key")

  let shopifyDomain: string | undefined
  let shopifyAccessToken: string | undefined

  if (activeStoreKey === "store1") {
    shopifyDomain = SHOPIFY_STORE_DOMAIN_1
    shopifyAccessToken = SHOPIFY_ACCESS_TOKEN_1
  } else if (activeStoreKey === "store2") {
    shopifyDomain = SHOPIFY_STORE_DOMAIN_2
    shopifyAccessToken = SHOPIFY_ACCESS_TOKEN_2
  }

  const requestHeaders = new Headers(request.headers)

  if (shopifyDomain) {
    requestHeaders.set("X-Shopify-Domain", shopifyDomain)
  }
  if (shopifyAccessToken) {
    requestHeaders.set("X-Shopify-Access-Token", shopifyAccessToken)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: "/api/:path*",
}
