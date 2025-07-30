import { NextResponse } from "next/server"

// Mock invoice storage - in production, use a database
const invoices: any[] = []

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      invoices,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Invoices API error:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const invoiceData = await request.json()

    const invoice = {
      id: Date.now().toString(),
      ...invoiceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    invoices.push(invoice)

    return NextResponse.json({
      success: true,
      invoice,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Create invoice API error:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
