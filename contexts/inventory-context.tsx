"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useShopifyAuth } from "@/contexts/shopify-auth-context"
import { useToast } from "@/hooks/use-toast"

// Define the simplified types for UI consumption
interface Product {
  id: string
  title: string
  handle: string
  status: string
  imageUrl?: string
  variants: Array<{
    id: string
    title: string
    sku: string
    inventory_quantity: number
    price: string
  }>
}

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
  }
  date: string
  total: number
  status: string // e.g., "fulfilled", "unfulfilled", "partial"
  paymentStatus: string // e.g., "paid", "pending", "refunded"
  items: number // total quantity of line items
  lineItems: Array<{
    id: string
    title: string
    quantity: number
    price: string
    sku: string
  }>
  shippingAddress?: {
    address1: string
    city: string
    province: string
    zip: string
    country: string
  }
}

interface ReportMetrics {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topSellingProducts: Array<{ title: string; sales: number }>
  itemsNeedingRestock: Array<{ title: string; sku: string; currentStock: number }>
}

interface InventoryContextType {
  products: Product[]
  orders: Order[]
  reportMetrics: ReportMetrics | null
  loadingProducts: boolean
  loadingOrders: boolean
  loadingReports: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  fetchOrders: () => Promise<void>
  fetchReportMetrics: () => Promise<void>
  updateProductQuantity: (variantId: string, newQuantity: number) => Promise<boolean>
  syncSKU: (sku: string) => Promise<boolean>
  bulkSync: () => Promise<boolean>
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryContextProvider({ children }: { children: React.ReactNode }) {
  const { shopifyDomain, shopifyAccessToken, isConnected, loading: authLoading } = useShopifyAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [reportMetrics, setReportMetrics] = useState<ReportMetrics | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingReports, setLoadingReports] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const getHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
      "X-Shopify-Domain": shopifyDomain || "",
      "X-Shopify-Access-Token": shopifyAccessToken || "",
      // X-Shopify-Active-Store-Key is handled by middleware for API routes
    }
  }, [shopifyDomain, shopifyAccessToken])

  const fetchProducts = useCallback(async () => {
    if (!isConnected || authLoading) {
      setLoadingProducts(false)
      setError("Please connect to a Shopify store to view inventory.")
      return
    }

    setLoadingProducts(true)
    setError(null)
    try {
      const response = await fetch("/api/inventory", { headers: getHeaders() })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch products")
      }
      const data = await response.json()
      setProducts(
        data.data.map((p: any) => ({
          id: p.id,
          title: p.title,
          handle: p.handle,
          status: p.status,
          imageUrl: p.image?.src,
          variants: p.variants,
        })),
      )
    } catch (err: any) {
      console.error("Error fetching products:", err)
      setError(err.message || "Failed to load products data.")
      toast({
        title: "Inventory Load Error",
        description: err.message || "Could not load products from Shopify.",
        variant: "destructive",
      })
    } finally {
      setLoadingProducts(false)
    }
  }, [isConnected, authLoading, getHeaders, toast])

  const fetchOrders = useCallback(async () => {
    if (!isConnected || authLoading) {
      setLoadingOrders(false)
      setError("Please connect to a Shopify store to view orders.")
      return
    }

    setLoadingOrders(true)
    setError(null)
    try {
      const response = await fetch("/api/orders", { headers: getHeaders() })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch orders")
      }
      const data = await response.json()
      setOrders(
        data.data.map((order: any) => ({
          id: order.id,
          orderNumber: order.name,
          customer: {
            name: order.customer
              ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim() || "Guest Customer"
              : "Guest Customer",
            email: order.email || "N/A",
          },
          date: order.created_at,
          total: Number.parseFloat(order.total_price),
          status: order.fulfillment_status || "unfulfilled",
          paymentStatus: order.financial_status,
          items: order.line_items.reduce((sum: number, item: any) => sum + item.quantity, 0),
          lineItems: order.line_items,
          shippingAddress: order.shipping_address,
        })),
      )
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      setError(err.message || "Failed to load orders data.")
      toast({
        title: "Order Load Error",
        description: err.message || "Could not load orders from Shopify.",
        variant: "destructive",
      })
    } finally {
      setLoadingOrders(false)
    }
  }, [isConnected, authLoading, getHeaders, toast])

  const fetchReportMetrics = useCallback(async () => {
    if (!isConnected || authLoading) {
      setLoadingReports(false)
      setError("Please connect to a Shopify store to view reports.")
      return
    }

    setLoadingReports(true)
    setError(null)
    try {
      const response = await fetch("/api/reports/performance", { headers: getHeaders() })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch report metrics")
      }
      const data = await response.json()
      setReportMetrics(data.data)
    } catch (err: any) {
      console.error("Error fetching report metrics:", err)
      setError(err.message || "Failed to load report metrics.")
      toast({
        title: "Report Load Error",
        description: err.message || "Could not load report metrics from Shopify.",
        variant: "destructive",
      })
    } finally {
      setLoadingReports(false)
    }
  }, [isConnected, authLoading, getHeaders, toast])

  const updateProductQuantity = useCallback(
    async (variantId: string, newQuantity: number) => {
      if (!isConnected || authLoading) {
        toast({
          title: "Update Failed",
          description: "Please connect to a Shopify store first.",
          variant: "destructive",
        })
        return false
      }
      try {
        const response = await fetch("/api/inventory/update", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ variantId, newQuantity }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to update quantity")
        }
        toast({
          title: "Inventory Updated",
          description: data.message || "Product quantity updated successfully.",
          variant: "success",
        })
        fetchProducts() // Refresh products after update
        return true
      } catch (err: any) {
        console.error("Error updating product quantity:", err)
        toast({
          title: "Update Error",
          description: err.message || "Failed to update product quantity.",
          variant: "destructive",
        })
        return false
      }
    },
    [isConnected, authLoading, getHeaders, fetchProducts, toast],
  )

  const syncSKU = useCallback(
    async (sku: string) => {
      if (!isConnected || authLoading) {
        toast({
          title: "Sync Failed",
          description: "Please connect to a Shopify store first.",
          variant: "destructive",
        })
        return false
      }
      try {
        const response = await fetch("/api/sync", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ sku }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to sync SKU")
        }
        toast({
          title: "SKU Synced",
          description: data.message || `SKU ${sku} synced successfully.`,
          variant: "success",
        })
        fetchProducts() // Refresh products after sync
        return true
      } catch (err: any) {
        console.error("Error syncing SKU:", err)
        toast({
          title: "Sync Error",
          description: err.message || `Failed to sync SKU ${sku}.`,
          variant: "destructive",
        })
        return false
      }
    },
    [isConnected, authLoading, getHeaders, fetchProducts, toast],
  )

  const bulkSync = useCallback(async () => {
    if (!isConnected || authLoading) {
      toast({
        title: "Bulk Sync Failed",
        description: "Please connect to a Shopify store first.",
        variant: "destructive",
      })
      return false
    }
    try {
      const response = await fetch("/api/sync/bulk", {
        method: "POST",
        headers: getHeaders(),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to perform bulk sync")
      }
      toast({
        title: "Bulk Sync Initiated",
        description: data.message || "Bulk sync process started.",
        variant: "success",
      })
      fetchProducts() // Refresh products after sync
      return true
    } catch (err: any) {
      console.error("Error during bulk sync:", err)
      toast({
        title: "Bulk Sync Error",
        description: err.message || "Failed to perform bulk sync.",
        variant: "destructive",
      })
      return false
    }
  }, [isConnected, authLoading, getHeaders, fetchProducts, toast])

  useEffect(() => {
    if (isConnected && !authLoading) {
      fetchProducts()
      fetchOrders()
      fetchReportMetrics()
    } else if (!isConnected && !authLoading) {
      setProducts([])
      setOrders([])
      setReportMetrics(null)
      setLoadingProducts(false)
      setLoadingOrders(false)
      setLoadingReports(false)
      setError("Please connect to a Shopify store to view data.")
    }
  }, [isConnected, authLoading, fetchProducts, fetchOrders, fetchReportMetrics])

  const value = React.useMemo(
    () => ({
      products,
      orders,
      reportMetrics,
      loadingProducts,
      loadingOrders,
      loadingReports,
      error,
      fetchProducts,
      fetchOrders,
      fetchReportMetrics,
      updateProductQuantity,
      syncSKU,
      bulkSync,
    }),
    [
      products,
      orders,
      reportMetrics,
      loadingProducts,
      loadingOrders,
      loadingReports,
      error,
      fetchProducts,
      fetchOrders,
      fetchReportMetrics,
      updateProductQuantity,
      syncSKU,
      bulkSync,
    ],
  )

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryContextProvider")
  }
  return context
}
