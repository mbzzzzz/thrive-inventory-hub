import { NextResponse } from "next/server"

export async function GET() {
  const domain = "mbuize-g9.myshopify.com"
  const accessToken = "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"
  const apiVersion = "2024-04"

  try {
    console.log("🧪 Testing direct connection to your store...")

    // Test shop endpoint
    const shopUrl = `https://${domain}/admin/api/${apiVersion}/shop.json`
    console.log("📞 Calling:", shopUrl)

    const shopResponse = await fetch(shopUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    console.log("📊 Shop Response Status:", shopResponse.status)

    if (!shopResponse.ok) {
      const errorText = await shopResponse.text()
      console.error("❌ Shop API Error:", errorText)

      return NextResponse.json({
        success: false,
        error: `Shop API failed: ${shopResponse.status} - ${errorText}`,
        url: shopUrl,
      })
    }

    const shopData = await shopResponse.json()
    console.log("✅ Shop data received:", shopData.shop?.name)

    // Test products endpoint
    const productsUrl = `https://${domain}/admin/api/${apiVersion}/products.json?limit=5`
    console.log("📞 Calling:", productsUrl)

    const productsResponse = await fetch(productsUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    console.log("📊 Products Response Status:", productsResponse.status)

    if (!productsResponse.ok) {
      const errorText = await productsResponse.text()
      console.error("❌ Products API Error:", errorText)
    }

    const productsData = productsResponse.ok ? await productsResponse.json() : null

    return NextResponse.json({
      success: true,
      shop: {
        name: shopData.shop?.name,
        email: shopData.shop?.email,
        domain: shopData.shop?.domain,
        currency: shopData.shop?.currency,
        timezone: shopData.shop?.timezone,
      },
      products: {
        count: productsData?.products?.length || 0,
        sample:
          productsData?.products?.slice(0, 3).map((p: any) => ({
            id: p.id,
            title: p.title,
            variants: p.variants?.length || 0,
          })) || [],
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("🚨 Debug API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
