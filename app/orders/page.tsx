"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, XCircle, Eye } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import { useToast } from "@/hooks/use-toast"

export default function OrdersPage() {
  const { orders, loadingOrders, error, fetchOrders } = useInventory()
  const { toast } = useToast()

  const getFinancialStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge variant="success">Paid</Badge>
      case "pending":
        return <Badge variant="warning">Pending</Badge>
      case "refunded":
        return <Badge variant="destructive">Refunded</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getFulfillmentStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Unfulfilled</Badge>
    switch (status.toLowerCase()) {
      case "fulfilled":
        return <Badge variant="success">Fulfilled</Badge>
      case "partial":
        return <Badge variant="warning">Partial</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loadingOrders) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-thrive-500" />
        <p className="mt-4 text-lg text-muted-foreground">Loading orders data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-destructive">
        <XCircle className="h-12 w-12" />
        <p className="mt-4 text-lg font-medium">Error: {error}</p>
        <p className="text-sm text-muted-foreground">Please check your Shopify connection in settings.</p>
        <Button onClick={fetchOrders} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Orders</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchOrders} disabled={loadingOrders}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>A list of your recent orders from Shopify.</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No orders found. Connect your Shopify store to view orders.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Financial Status</TableHead>
                  <TableHead>Fulfillment Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>{order.customer.email}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    <TableCell>{getFinancialStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell>{getFulfillmentStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/orders/${order.id}`} passHref>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only sm:not-sr-only ml-1">View</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
