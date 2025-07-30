"use client"

import { useState, useEffect } from "react"
import { Search, Package, Edit, Plus, Download, Upload, AlertTriangle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface InventoryProduct {
  id: string
  sku: string
  title: string
  variant: string
  price: number
  cost: number
  quantity: number
  reserved: number
  available: number
  locations: Array<{
    id: string
    name: string
    quantity: number
  }>
  lowStockThreshold: number
  category: string
  vendor: string
  weight: number
  lastUpdated: string
  status: "active" | "draft" | "archived"
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      const response = await fetch("/api/inventory/detailed")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStockStatus = (product: InventoryProduct) => {
    if (product.available <= 0) return "out-of-stock"
    if (product.available <= product.lowStockThreshold) return "low-stock"
    return "in-stock"
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "out-of-stock":
        return "bg-red-100 text-red-800"
      case "low-stock":
        return "bg-yellow-100 text-yellow-800"
      case "in-stock":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter

    let matchesStock = true
    if (stockFilter === "low-stock") {
      matchesStock = product.available <= product.lowStockThreshold && product.available > 0
    } else if (stockFilter === "out-of-stock") {
      matchesStock = product.available <= 0
    } else if (stockFilter === "in-stock") {
      matchesStock = product.available > product.lowStockThreshold
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesStock
  })

  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + product.quantity * product.cost, 0)
  const lowStockCount = products.filter((p) => getStockStatus(p) === "low-stock").length
  const outOfStockCount = products.filter((p) => getStockStatus(p) === "out-of-stock").length

  const categories = [...new Set(products.map((p) => p.category))].filter(Boolean)
  const vendors = [...new Set(products.map((p) => p.vendor))].filter(Boolean)

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    try {
      const response = await fetch("/api/inventory/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      })

      if (response.ok) {
        await fetchInventoryData()
      }
    } catch (error) {
      console.error("Failed to update quantity:", error)
    }
  }

  const handleBulkUpdate = async () => {
    try {
      const response = await fetch("/api/inventory/bulk-update", {
        method: "POST",
      })

      if (response.ok) {
        await fetchInventoryData()
        alert("Bulk update completed successfully!")
      }
    } catch (error) {
      console.error("Failed to bulk update:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Inventory Management</h1>
            <p className="text-slate-600">Manage your product inventory and stock levels</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBulkUpdate}>
              <Upload className="w-4 h-4 mr-2" />
              Sync All
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalProducts}</div>
              <div className="text-sm text-slate-600">{categories.length} categories</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                At cost price
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
              <div className="text-sm text-slate-600">Need attention</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
              <div className="text-sm text-slate-600">Urgent restock</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search products, SKUs, or vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product)
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.title}</div>
                        <div className="text-sm text-slate-500">{product.variant}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.vendor}</TableCell>
                    <TableCell className="font-medium">${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.available}</span>
                        {stockStatus !== "in-stock" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                      </div>
                    </TableCell>
                    <TableCell>{product.reserved}</TableCell>
                    <TableCell>
                      <Badge className={getStockStatusColor(stockStatus)}>{stockStatus.replace("-", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Inventory - {product.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Current Available Quantity</Label>
                                <Input
                                  type="number"
                                  defaultValue={product.available}
                                  onChange={(e) => {
                                    const newQuantity = Number.parseInt(e.target.value) || 0
                                    // You can add real-time update here
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Low Stock Threshold</Label>
                                <Input type="number" defaultValue={product.lowStockThreshold} />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Cancel</Button>
                                <Button
                                  onClick={() => {
                                    // Handle update
                                    handleUpdateQuantity(product.id, product.available)
                                  }}
                                >
                                  Update
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Low Stock Alert */}
        {lowStockCount > 0 && (
          <Card className="mt-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                You have {lowStockCount} items running low on stock and {outOfStockCount} items out of stock. Consider
                restocking these items soon to avoid stockouts.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
