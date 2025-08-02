"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import { Button } from "@/components/ui/button"

export default function ReportsPage() {
  const { reportMetrics, products, loadingReports, loadingProducts, error, fetchReportMetrics, fetchProducts } =
    useInventory()

  if (loadingReports || loadingProducts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-thrive-500" />
        <p className="mt-4 text-lg text-muted-foreground">Generating reports...</p>
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
            fetchReportMetrics()
            fetchProducts()
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
        <h1 className="text-lg font-semibold md:text-2xl">Reports</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              fetchReportMetrics()
              fetchProducts()
            }}
            disabled={loadingReports || loadingProducts}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Key metrics for your store's performance.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">${reportMetrics?.totalSales.toFixed(2) || "0.00"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{reportMetrics?.totalOrders || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
              <p className="text-2xl font-bold">${reportMetrics?.averageOrderValue.toFixed(2) || "0.00"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Products with the highest sales volume.</CardDescription>
          </CardHeader>
          <CardContent>
            {reportMetrics?.topSellingProducts && reportMetrics.topSellingProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Sales ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportMetrics.topSellingProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell className="text-right">${product.sales.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground p-4">No top selling products data available.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items Needing Restock</CardTitle>
            <CardDescription>Products with low inventory levels.</CardDescription>
          </CardHeader>
          <CardContent>
            {reportMetrics?.itemsNeedingRestock && reportMetrics.itemsNeedingRestock.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportMetrics.itemsNeedingRestock.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell className="text-right">{item.currentStock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground p-4">No items currently need restock.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Products Overview</CardTitle>
            <CardDescription>A comprehensive list of all products and their stock levels.</CardDescription>
          </CardHeader>
          <CardContent>
            {products && products.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.flatMap((product) =>
                    product.variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="font-medium">
                          {product.title} {variant.title !== "Default Title" && `- ${variant.title}`}
                        </TableCell>
                        <TableCell>{variant.sku}</TableCell>
                        <TableCell className="text-right">{variant.inventory_quantity}</TableCell>
                        <TableCell className="text-right">${Number.parseFloat(variant.price).toFixed(2)}</TableCell>
                      </TableRow>
                    )),
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground p-4">No product data available.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
