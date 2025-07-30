"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Trash2, Save, Send, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface InvoiceItem {
  id: string
  sku: string
  description: string
  quantity: number
  price: number
  total: number
}

interface Customer {
  id: string
  name: string
  email: string
  address: string
  phone?: string
}

export default function CreateInvoicePage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [customer, setCustomer] = useState<Customer>({
    id: "",
    name: "",
    email: "",
    address: "",
    phone: "",
  })
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", sku: "", description: "", quantity: 1, price: 0, total: 0 },
  ])
  const [notes, setNotes] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Generate invoice number
    const now = new Date()
    const invoiceNum = `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(3, "0")}`
    setInvoiceNumber(invoiceNum)

    // Set default due date (30 days from now)
    const defaultDueDate = new Date()
    defaultDueDate.setDate(defaultDueDate.getDate() + 30)
    setDueDate(defaultDueDate.toISOString().split("T")[0])

    // Fetch products and order data
    fetchData()
  }, [orderId])

  const fetchData = async () => {
    try {
      // Fetch available products
      const productsResponse = await fetch("/api/products")
      if (productsResponse.ok) {
        const products = await productsResponse.json()
        setAvailableProducts(products)
      }

      // If orderId is provided, fetch order data
      if (orderId) {
        const orderResponse = await fetch(`/api/orders/${orderId}`)
        if (orderResponse.ok) {
          const orderData = await orderResponse.json()
          const order = orderData.order

          // Pre-fill customer information
          setCustomer({
            id: orderId,
            name: order.customer.name,
            email: order.customer.email,
            phone: order.customer.phone || "",
            address: `${order.customer.address.address1}\n${order.customer.address.city}, ${order.customer.address.province} ${order.customer.address.zip}\n${order.customer.address.country}`,
          })

          // Pre-fill items from order
          const orderItems = order.items.map((item: any, index: number) => ({
            id: (index + 1).toString(),
            sku: item.sku,
            description: item.title,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          }))

          setItems(orderItems)
          setNotes(`Invoice for Order ${order.orderNumber}`)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      sku: "",
      description: "",
      quantity: 1,
      price: 0,
      total: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          // Auto-fill description and price when SKU is selected
          if (field === "sku") {
            const product = availableProducts.find((p) => p.sku === value)
            if (product) {
              updatedItem.description = product.description
              updatedItem.price = product.price || 0
            }
          }

          // Calculate total
          updatedItem.total = updatedItem.quantity * updatedItem.price
          return updatedItem
        }
        return item
      }),
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const invoiceData = {
        invoiceNumber,
        customer,
        items,
        notes,
        dueDate,
        subtotal,
        tax,
        total,
        status: "draft",
      }

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        alert("Invoice saved successfully!")
      } else {
        alert("Failed to save invoice")
      }
    } catch (error) {
      console.error("Error saving invoice:", error)
      alert("Error saving invoice")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    setIsLoading(true)
    try {
      const invoiceData = {
        invoiceNumber,
        customer,
        items,
        notes,
        dueDate,
        subtotal,
        tax,
        total,
        status: "sent",
      }

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        // Also send email
        const emailResponse = await fetch("/api/invoices/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceData }),
        })

        if (emailResponse.ok) {
          alert("Invoice sent successfully!")
        } else {
          alert("Invoice saved but failed to send email")
        }
      } else {
        alert("Failed to send invoice")
      }
    } catch (error) {
      console.error("Error sending invoice:", error)
      alert("Error sending invoice")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const invoiceData = {
        invoiceNumber,
        customer,
        items,
        notes,
        dueDate,
        subtotal,
        tax,
        total,
      }

      const response = await fetch("/api/invoices/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${invoiceNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert("Failed to generate PDF")
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/invoices">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Create Invoice</h1>
              <p className="text-slate-600">
                {orderId ? `Generate invoice for Order ${orderId}` : "Generate a new invoice for your customer"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleSend} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              <Send className="w-4 h-4 mr-2" />
              Send Invoice
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoice-number">Invoice Number</Label>
                    <Input
                      id="invoice-number"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="INV-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input
                      id="customer-name"
                      placeholder="Enter customer name"
                      value={customer.name}
                      onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-email">Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="customer@example.com"
                      value={customer.email}
                      onChange={(e) => setCustomer((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer-phone">Phone</Label>
                    <Input
                      id="customer-phone"
                      placeholder="Phone number"
                      value={customer.phone}
                      onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="customer-address">Address</Label>
                  <Textarea
                    id="customer-address"
                    placeholder="Enter customer address"
                    value={customer.address}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invoice Items</CardTitle>
                  <Button onClick={addItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-4 items-end p-4 border border-slate-200 rounded-lg"
                    >
                      <div className="col-span-3">
                        <Label>SKU</Label>
                        <Select value={item.sku} onValueChange={(value) => updateItem(item.id, "sku", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select SKU" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map((product) => (
                              <SelectItem key={product.sku} value={product.sku}>
                                {product.sku}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-4">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or terms..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate mr-2">{item.description || `Item ${index + 1}`}</span>
                      <span>${item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 text-xs text-slate-500">
                  <p>Invoice Number: {invoiceNumber}</p>
                  <p>Due Date: {new Date(dueDate).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
