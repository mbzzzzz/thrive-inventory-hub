"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInventory } from "@/contexts/inventory-context"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export function InventoryHeatmap() {
  const { products, loadingProducts, error } = useInventory()

  if (loadingProducts) {
    return (
      <Card className="col-span-full lg:col-span-3">
        <CardHeader>
          <CardTitle>Inventory Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-1 p-4">
            {Array.from({ length: 100 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-sm" />
            ))}
          </div>
          <div className="text-center text-muted-foreground mt-4">Loading inventory data...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-full lg:col-span-3">
        <CardHeader>
          <CardTitle>Inventory Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8 text-destructive">
          <AlertCircle className="h-10 w-10 mb-4" />
          <p className="text-lg">Error loading inventory: {error}</p>
          <p className="text-sm text-muted-foreground mt-2">Please check your Shopify connection.</p>
        </CardContent>
      </Card>
    )
  }

  // Flatten all product variants into a single array for heatmap calculation
  const allVariants = products.flatMap((product) =>
    product.variants.map((variant) => ({
      ...variant,
      productTitle: product.title,
    })),
  )

  // Determine min and max inventory for color scaling
  const quantities = allVariants.map((v) => v.inventory_quantity)
  const minQuantity = Math.min(...quantities)
  const maxQuantity = Math.max(...quantities)

  // Function to get color based on quantity
  const getColor = (quantity: number) => {
    if (maxQuantity === minQuantity) return "bg-thrive-500" // All same quantity
    const range = maxQuantity - minQuantity
    const normalized = (quantity - minQuantity) / range

    if (normalized < 0.2) return "bg-red-500" // Low stock
    if (normalized < 0.5) return "bg-yellow-500" // Medium stock
    return "bg-thrive-500" // High stock
  }

  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle>Inventory Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        {allVariants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No inventory data available.</div>
        ) : (
          <div className="grid grid-cols-10 gap-1 p-4">
            {allVariants.slice(0, 100).map((variant) => (
              <div
                key={variant.id}
                className={`h-8 w-8 rounded-sm flex items-center justify-center text-xs text-white font-bold ${getColor(variant.inventory_quantity)}`}
                title={`${variant.productTitle} - ${variant.title}: ${variant.inventory_quantity}`}
              >
                {variant.inventory_quantity}
              </div>
            ))}
            {allVariants.length > 100 && (
              <div className="col-span-10 text-center text-muted-foreground mt-2">Showing first 100 variants.</div>
            )}
          </div>
        )}
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-red-500" /> Low Stock
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-yellow-500" /> Medium Stock
          </div>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-thrive-500" /> High Stock
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
