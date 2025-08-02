"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, PlusCircle, Download, Send, AlertCircle, RefreshCw } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import { useToast } from "@/hooks/use-toast"

export default function InvoicesPage() {
  const { orders, loadingOrders, error, fetchOrders } = useInventory()
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [isSending, setIsSending] = useState<string | null>(null)

  const getHeaders = () => {
    // These headers are passed from the client to the API route,
    // which then uses middleware to inject the actual Shopify credentials.
    // This is a simplified approach for the demo.
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

  const handleDownloadPdf = async (orderId: string, orderName: string) => {
    setIsDownloading(orderId)
    try {
      const response = await fetch("/api/invoices/pdf", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${orderName}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast({
        title: "PDF Downloaded",
        description: `Invoice for ${orderName} downloaded successfully.`,
        variant: "success",
      })
    } catch (err: any) {
      console.error("Error downloading PDF:", err)
      toast({
        title: "Download Failed",
        description: err.message || "Could not download invoice PDF.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(null)
    }
  }

  const handleSendEmail = async (order: (typeof orders)[0]) => {
    setIsSending(order.id)
    try {
      // In a real app, you'd generate the PDF first, then attach it or link to it.
      // For this demo, we'll send a simple email with order details.
      const subject = `Your Invoice for Order ${order.orderNumber} from Thrive Inventory Hub`
      const htmlContent = `
        <h1>Invoice for Order ${order.orderNumber}</h1>
        <p>Dear ${order.customer.name},</p>
        <p>Thank you for your purchase! Here are the details for your order:</p>
        <p><strong>Order Total:</strong> $${order.total.toFixed(2)}</p>
        <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
        <p><strong>Fulfillment Status:</strong> ${order.status}</p>
        <p>You can download the full PDF invoice from our portal (link not active in demo).</p>
        <p>Best regards,<br/>Thrive Inventory Hub</p>
      `
      const textContent = `Invoice for Order ${order.orderNumber}\n\nDear ${order.customer.name},\n\nThank you for your purchase! Here are the details for your order:\nOrder Total: $${order.total.toFixed(2)}\nPayment Status: ${order.paymentStatus}\nFulfillment Status: ${order.status}\n\nBest regards,\nThrive Inventory Hub`

      const response = await fetch("/api/invoices/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: order.customer.email,
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
        description: `Invoice for ${order.orderNumber} sent to ${order.customer.email}.`,
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
      setIsSending(null)
    }
  }

  if (loadingOrders) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-thrive-500" />
        <p className="mt-4 text-lg text-muted-foreground">Loading invoices...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-destructive">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg">Error: {error}</p>
        <p className="text-sm text-muted-foreground mt-2">Please connect a Shopify store in settings.</p>
        <Button onClick={fetchOrders} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Invoices</h1>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/invoices/create" passHref>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Create Invoice</span>
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={fetchOrders} disabled={loadingOrders}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>View and manage your generated invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">No invoices found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.paymentStatus === "paid"
                            ? "success"
                            : order.paymentStatus === "pending"
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPdf(order.id, order.orderNumber)}
                          disabled={isDownloading === order.id}
                        >
                          {isDownloading === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span className="sr-only sm:not-sr-only ml-1">PDF</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendEmail(order)}
                          disabled={isSending === order.id}
                        >
                          {isSending === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          <span className="sr-only sm:not-sr-only ml-1">Email</span>
                        </Button>
                      </div>
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
