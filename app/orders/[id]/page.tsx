"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Package, User, MapPin, CreditCard, Download, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useParams } from "next/navigation"

interface OrderDetails {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone?: string
    address: {
      address1: string
      address2?: string
      city: string
      province: string
      zip: string
      country: string
    }
  }
  date: string
  status: string
  paymentStatus: string
  total: number
  subtotal: number
  tax: number
  shipping: number
  items: Array<{
    id: string
    sku: string
    title: string
    variant: string
    quantity: number
    price: number
    total: number
  }>
  shippingMethod: string
  trackingNumber?: string
  notes?: string
}

export default function OrderDetailsPage() {
  const params = useParams()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetails()
  }, [params.id])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-slate-200 rounded"></div>
                <div className="h-48 bg-slate-200 rounded"></div>
              </div>
              <div className="h-96 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Order Not Found</h1>
          <Link href="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Order {order.orderNumber}</h1>
              <p className="text-slate-600">Placed on {new Date(order.date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Link href={`/invoices/create?orderId=${order.id}`}>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <DollarSign className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-slate-600">
                          {item.variant} • SKU: {item.sku}
                        </div>
                        <div className="text-sm text-slate-600">Quantity: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.total.toFixed(2)}</div>
                        <div className="text-sm text-slate-600">${item.price.toFixed(2)} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Contact Details</h4>
                    <div className="space-y-1 text-sm">
                      <div>{order.customer.name}</div>
                      <div>{order.customer.email}</div>
                      {order.customer.phone && <div>{order.customer.phone}</div>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div>{order.customer.address.address1}</div>
                      {order.customer.address.address2 && <div>{order.customer.address.address2}</div>}
                      <div>
                        {order.customer.address.city}, {order.customer.address.province} {order.customer.address.zip}
                      </div>
                      <div>{order.customer.address.country}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Order Status:</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment:</span>
                  <Badge
                    className={
                      order.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping:</span>
                  <span className="text-sm">{order.shippingMethod}</span>
                </div>
                {order.trackingNumber && (
                  <div className="flex items-center justify-between">
                    <span>Tracking:</span>
                    <span className="text-sm font-mono">{order.trackingNumber}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge
                      className={
                        order.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
