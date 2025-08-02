"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, RefreshCw, AlertCircle, Save } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import { useToast } from "@/hooks/use-toast"

export default function InventoryPage() {
  const { products, loadingProducts, error, fetchProducts, updateProductQuantity } = useInventory()
  const { toast } = useToast()
  const [editingQuantities, setEditingQuantities] = useState<{ [variantId: string]: number }>({})
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null)

  const handleQuantityChange = (variantId: string, newQuantity: number) => {
    setEditingQuantities((prev) => ({
      ...prev,
      [variantId]: newQuantity,
    }))
  }

  const handleSaveQuantity = async (variantId: string) => {
    const newQuantity = editingQuantities[variantId]
    if (typeof newQuantity !== "number" || isNaN(newQuantity)) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid number for the quantity.",
        variant: "destructive",
      })
      return
    }
    setSavingVariantId(variantId)
    const success = await updateProductQuantity(variantId, newQuantity)
    setSavingVariantId(null)
    if (success) {
      setEditingQuantities((prev) => {
        const newState = { ...prev }
        delete newState[variantId]
        return newState
      })
    }
  }

  if (loadingProducts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-thrive-500" />
        <p className="mt-4 text-lg text-muted-foreground">Loading inventory data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-destructive">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg">Error: {error}</p>
        <p className="text-sm text-muted-foreground mt-2">Please connect a Shopify store in settings.</p>
        <Button onClick={fetchProducts} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Inventory</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchProducts} disabled={loadingProducts}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Manage stock levels for your products.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">No products found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.flatMap((product) =>
                  product.variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt="Product image"
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={product.imageUrl || "/placeholder.svg?height=64&width=64&query=product"}
                          width="64"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>{variant.title}</TableCell>
                      <TableCell>{variant.sku}</TableCell>
                      <TableCell className="text-right">${Number.parseFloat(variant.price).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={
                            editingQuantities[variant.id] !== undefined
                              ? editingQuantities[variant.id]
                              : variant.inventory_quantity
                          }
                          onChange={(e) => handleQuantityChange(variant.id, Number.parseInt(e.target.value))}
                          className="w-24 text-right"
                          min="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.status === "active" ? "success" : "secondary"}>{product.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingQuantities[variant.id] !== undefined &&
                        editingQuantities[variant.id] !== variant.inventory_quantity ? (
                          <Button
                            size="sm"
                            onClick={() => handleSaveQuantity(variant.id)}
                            disabled={savingVariantId === variant.id}
                          >
                            {savingVariantId === variant.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            <span className="sr-only sm:not-sr-only ml-1">Save</span>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
