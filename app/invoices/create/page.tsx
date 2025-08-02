"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, XCircle, Download, Send, AlertCircle, RefreshCw } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import { useToast } from "@/hooks/use-toast"

interface InvoiceItem {
  id: string
  title: string
  sku: string
  price: number
  quantity: number
}

export default function CreateInvoicePage() {
  const { products, orders, loadingProducts, loadingOrders, error, fetchProducts, fetchOrders } = useInventory()
  const { toast } = useToast()

  const [selectedOrderId, setSelectedOrderId] = useState<string>("")
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [invoiceNotes, setInvoiceNotes] = useState("")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      "X-Shopify-Domain": localStorage.getItem("active_shopify_store_key")
        ? localStorage.getItem(`${localStorage.getItem("active_shopify_store_key")}_shopify_domain`) || ""
        : "",
      "X-Shopify-Access-Token": localStorage.getItem("active_shopify_store_key")
        ? localStorage.getItem(`${localStorage.getItem("active_shopify_store_key")}_shopify_access_token`) || ""
        : "",
      "X-Shopify-Active-Store-Key": localStorage.getItem("active_shopify_store_key") || "",
    }
  }

  useEffect(() => {
    if (selectedOrderId) {
      const order = orders.find((o) => o.id === selectedOrderId)
      if (order) {
        setCustomerName(order.customer.name)
        setCustomerEmail(order.customer.email)
        setInvoiceItems(
          order.lineItems.map((item) => ({
            id: item.id,
            title: item.title,
            sku: item.sku,
            price: Number.parseFloat(item.price),
            quantity: item.quantity,
          })),
        )
      }
    } else {
      setCustomerName("")
      setCustomerEmail("")
      setInvoiceItems([])
    }
  }, [selectedOrderId, orders])

  const subtotal = useMemo(
    () => invoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [invoiceItems],
  )
  const taxRate = 0.08 // Example tax rate
  const tax = subtotal * taxRate
  const total = subtotal + tax

  const handleAddItem = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (product && product.variants.length > 0) {
      // For simplicity, add the first variant
      const variant = product.variants[0]
      setInvoiceItems((prev) => [
        ...prev,
        {
          id: variant.id,
          title: product.title + (variant.title !== "Default Title" ? ` - ${variant.title}` : ""),
          sku: variant.sku,
          price: Number.parseFloat(variant.price),
          quantity: 1,
        },
      ])
    }
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setInvoiceItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)),
    )
  }

  const handleRemoveItem = (id: string) => {
    setInvoiceItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleGeneratePdf = async () => {
    if (!selectedOrderId) {
      toast({
        title: "Missing Order",
        description: "Please select an order to generate an invoice.",
        variant: "destructive",
      })
      return
    }
    setIsGeneratingPdf(true)
    try {
      // In a real app, you'd pass all invoice details, not just orderId
      // For this demo, we're relying on the API to fetch order details by ID
      const response = await fetch("/api/invoices/pdf", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ orderId: selectedOrderId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${orders.find((o) => o.id === selectedOrderId)?.orderNumber || "new"}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast({
        title: "PDF Generated",
        description: "Invoice PDF downloaded successfully.",
        variant: "success",
      })
    } catch (err: any) {
      console.error("Error generating PDF:", err)
      toast({
        title: "PDF Generation Failed",
        description: err.message || "Could not generate invoice PDF.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleSendEmail = async () => {
    if (!customerEmail || !customerName || invoiceItems.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer details and add items to the invoice.",
        variant: "destructive",
      })
      return
    }
    setIsSendingEmail(true)
    try {
      const subject = `Your Invoice from Thrive Inventory Hub`
      const htmlContent = `
        <h1>Invoice for ${customerName}</h1>
        <p>Thank you for your business! Here are the details for your invoice:</p>
        <ul>
          ${invoiceItems
            .map(
              (item) =>
                `<li>${item.title} (SKU: ${item.sku}) - ${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}</li>`,
            )
            .join("")}
        </ul>
        <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
        <p><strong>Tax:</strong> $${tax.toFixed(2)}</p>
        <p><strong>Total:</strong> $${total.toFixed(2)}</p>
        ${invoiceNotes ? `<p><strong>Notes:</strong> ${invoiceNotes}</p>` : ""}
        <p>Best regards,<br/>Thrive Inventory Hub</p>
      `
      const textContent = `Invoice for ${customerName}\n\nThank you for your business! Here are the details for your invoice:\n${invoiceItems.map((item) => `${item.title} (SKU: ${item.sku}) - ${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`).join("\n")}\n\nSubtotal: $${subtotal.toFixed(2)}\nTax: $${tax.toFixed(2)}\nTotal: $${total.toFixed(2)}\n${invoiceNotes ? `Notes: ${invoiceNotes}\n` : ""}\nBest regards,\nThrive Inventory Hub`

      const response = await fetch("/api/invoices/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: customerEmail,
          subject,
          htmlContent,
          textContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send email")
      }

      toast({
        title: "Email Sent",
        description: `Invoice sent to ${customerEmail}.`,
        variant: "success",
      })
    } catch (err: any) {
      console.error("Error sending email:", err)
      toast({
        title: "Email Failed",
        description: err.message || "Could not send invoice email. Check Resend API key.",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  if (loadingProducts || loadingOrders) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-thrive-500" />
        <p className="mt-4 text-lg text-muted-foreground">Loading data for invoice creation...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-destructive">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg">Error: {error}</p>
        <p className="text-sm text-muted-foreground mt-2">Please connect a Shopify store in settings.</p>
        <Button
          onClick={() => {
            fetchProducts()
            fetchOrders()
          }}
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Create Invoice</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Fill in the details for your new invoice.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="order-select">Select Existing Order (Optional)</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger id="order-select">
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.orderNumber} - {order.customer.name} ({new Date(order.date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer-name">Customer Name</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer-email">Customer Email</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invoice-notes">Invoice Notes</Label>
              <Textarea
                id="invoice-notes"
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder="Add any specific notes for the customer here..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Invoice Items</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No items added.
                      </TableCell>
                    </TableRow>
                  )}
                  {invoiceItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, Number.parseInt(e.target.value))}
                          className="w-20 text-right"
                          min="1"
                        />
                      </TableCell>
                      <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(item.id)}>
                          <XCircle className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Select onValueChange={handleAddItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Add Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Summary & Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({taxRate * 100}%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf || invoiceItems.length === 0}>
              {isGeneratingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Generate PDF
            </Button>
            <Button onClick={handleSendEmail} disabled={isSendingEmail || invoiceItems.length === 0}>
              {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send via Email
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
