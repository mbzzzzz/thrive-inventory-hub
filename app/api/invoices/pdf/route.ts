import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const invoiceData = await request.json()

    // In production, use a PDF generation library like Puppeteer, jsPDF, or PDFKit
    console.log("📄 Generating PDF for invoice:", invoiceData.invoiceNumber)

    // Create a simple HTML-based PDF response
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceData.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .invoice-details { margin-bottom: 30px; }
            .customer-info { margin-bottom: 30px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .totals { text-align: right; }
            .total-row { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <h2>${invoiceData.invoiceNumber}</h2>
          </div>
          
          <div class="invoice-details">
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString()}</p>
          </div>
          
          <div class="customer-info">
            <h3>Bill To:</h3>
            <p><strong>${invoiceData.customer.name}</strong></p>
            <p>${invoiceData.customer.email}</p>
            ${invoiceData.customer.phone ? `<p>${invoiceData.customer.phone}</p>` : ""}
            <p>${invoiceData.customer.address.replace(/\n/g, "<br>")}</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items
                .map(
                  (item: any) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.sku}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Subtotal: $${invoiceData.subtotal.toFixed(2)}</p>
            <p>Tax: $${invoiceData.tax.toFixed(2)}</p>
            <p class="total-row">Total: $${invoiceData.total.toFixed(2)}</p>
          </div>
          
          ${
            invoiceData.notes
              ? `
            <div style="margin-top: 40px;">
              <h3>Notes:</h3>
              <p>${invoiceData.notes}</p>
            </div>
          `
              : ""
          }
        </body>
      </html>
    `

    // In production, convert HTML to PDF using a library
    // For now, return the HTML as a downloadable file
    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${invoiceData.invoiceNumber}.html"`,
      },
    })
  } catch (error) {
    console.error("PDF generation API error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
