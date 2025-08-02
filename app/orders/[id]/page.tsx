"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, XCircle } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import { useToast } from "@/hooks/use-toast"

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params.id as string
  const { fetchOrderById, error: inventoryError } = useInventory()
  const { toast } = useToast()

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getOrderDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedOrder = await fetchOrderById(orderId)
        if (fetchedOrder) {
          setOrder(fetchedOrder)
        } else {
          setError("Order not found or failed to load.")
          toast({
            title: "Order Not Found",
            description: `Could not find order with ID: ${orderId}.`,
            variant: "destructive",
          })
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while fetching order details.")
        toast({
          title: "Order Details Error",
          description: err.message || "An unexpected error occurred.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      getOrderDetails()
    }
  }, [orderId, fetchOrderById, toast])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-thrive-500" />
        <p className="mt-4 text-lg text-muted-foreground">Loading order details...</p>
      </div>
    )
  }

  if (error || inventoryError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-destructive">
        <XCircle className="h-12 w-12" />
        <p className="mt-4 text-lg font-medium">Error: {error || inventoryError}</p>
        <p className="text-sm text-muted-foreground">Please check your Shopify connection in settings.</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <p className="text-lg">Order not found.</p>
      </div>
    )
  }

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Order #{order.orderNumber}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-medium">{new Date(order.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge
                variant={
                  order.status === "delivered" ? "success" : order.status === "pending" ? "secondary" : "default"
                }
              >
                {order.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <Badge
                variant={
                  order.paymentStatus === "paid"
                    ? "success"
                    : order.paymentStatus === "pending"
                      ? "secondary"
                      : "destructive"
                }
              >
                {order.paymentStatus}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <p className="font-medium">{order.customer.name}</p>
            <p className="text-sm text-muted-foreground">{order.customer.email}</p>
            {order.customer.phone && <p className="text-sm text-muted-foreground">{order.customer.phone}</p>}
            <p className="text-sm">
              {order.customer.address.address1}
              {order.customer.address.address2 && `, ${order.customer.address.address2}`}
            </p>
            <p className="text-sm">
              {order.customer.address.city}, {order.customer.address.province} {order.customer.address.zip}
            </p>
            <p className="text-sm">{order.customer.address.country}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span>Method:</span>
              <span className="font-medium">{order.shippingMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Cost:</span>
              <span className="font-medium">${order.shipping.toFixed(2)}</span>
            </div>
            {order.trackingNumber && (
              <div className="flex justify-between">
                <span>Tracking:</span>
                <span className="font-medium">{order.trackingNumber}</span>
              </div>
            )}
            {order.notes && (
              <div>
                <h3 className="font-medium mt-4">Notes:</h3>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>
                    {item.title} {item.variant && `(${item.variant})`}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-4">
            <div className="grid gap-1 text-right">
              <div>
                Subtotal: <span className="font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              <div>
                Shipping: <span className="font-medium">${order.shipping.toFixed(2)}</span>
              </div>
              <div>
                Tax: <span className="font-medium">${order.tax.toFixed(2)}</span>
              </div>
              <div className="font-bold text-lg">
                Total: <span className="text-thrive-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
