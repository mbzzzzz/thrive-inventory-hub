"use client"

import { useEffect, useState } from "react"
import { MetricsCards } from "@/components/metrics-cards"
import { InventoryHeatmap } from "@/components/inventory-heatmap"
import { SyncMonitor } from "@/components/sync-monitor"
import { AlertsPanel } from "@/components/alerts-panel"
import { QuickActions } from "@/components/quick-actions"
import { Loader2, XCircle } from "lucide-react"
import { useShopifyAuth } from "@/contexts/shopify-auth-context"
import { useToast } from "@/hooks/use-toast"

interface OverallMetrics {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topSellingProducts: Array<{ title: string; sales: number }>
  itemsNeedingRestock: Array<{ title: string; sku: string; currentStock: number }>
}

interface SyncMetrics {
  totalSyncs: number
  successRate: number
  avgLatency: number
  activeSyncs: number
  errorCount: number
  uptime: number
}

interface Alert {
  id: number
  type: "warning" | "error" | "success" | "info"
  message: string
  timestamp: number
}

export default function DashboardPage() {
  const { shopifyDomain, shopifyAccessToken, activeStoreKey, isConnected, loading: authLoading } = useShopifyAuth()
  const { toast } = useToast()

  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics | null>(null)
  const [syncMetrics, setSyncMetrics] = useState<SyncMetrics | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  const getHeaders = () => {
    if (!shopifyDomain || !shopifyAccessToken || !activeStoreKey) {
      return {}
    }
    return {
      "Content-Type": "application/json",
      "X-Shopify-Domain": shopifyDomain,
      "X-Shopify-Access-Token": shopifyAccessToken,
      "X-Shopify-Active-Store-Key": activeStoreKey,
    }
  }

  const fetchData = async () => {
    if (!isConnected) {
      setLoadingData(false)
      setDataError("Not connected to Shopify. Please connect a store in settings.")
      setOverallMetrics(null)
      setSyncMetrics(null)
      setAlerts([])
      return
    }

    setLoadingData(true)
    setDataError(null)
    try {
      // Fetch overall metrics
      const metricsResponse = await fetch("/api/reports/performance", { headers: getHeaders() })
      const metricsData = await metricsResponse.json()
      if (metricsData.success) {
        setOverallMetrics(metricsData.data)
        // Simulate sync metrics and alerts based on overall metrics
        setSyncMetrics({
          totalSyncs: metricsData.data.totalProducts,
          successRate: 98, // Mock value
          avgLatency: 150, // Mock value
          activeSyncs: 1,
          errorCount: metricsData.data.lowStockCount > 0 ? 1 : 0,
          uptime: 99.9, // Mock value
        })
        setAlerts([
          {
            id: 1,
            type: metricsData.data.lowStockCount > 0 ? "warning" : "success",
            message:
              metricsData.data.lowStockCount > 0
                ? `${metricsData.data.lowStockCount} items are running low on stock.`
                : "All systems nominal. No low stock alerts.",
            timestamp: Date.now(),
          },
        ])
      } else {
        setDataError(metricsData.error || "Failed to fetch dashboard metrics.")
        toast({
          title: "Dashboard Data Failed",
          description: metricsData.error || "Could not retrieve dashboard data.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      setDataError(err.message || "An unexpected error occurred while fetching dashboard data.")
      toast({
        title: "Dashboard Data Error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (isConnected) {
      fetchData()
    } else {
      setLoadingData(false)
      setDataError("Please connect your Shopify store in the settings to view data.")
    }
  }, [isConnected, shopifyDomain, shopifyAccessToken, activeStoreKey]) // Re-fetch when connection changes

  const heatmapData = [
    {
      id: "Channel A",
      data: [
        { x: "Mon", y: 10, value: 50 },
        { x: "Tue", y: 10, value: 60 },
        { x: "Wed", y: 10, value: 70 },
        { x: "Thu", y: 10, value: 80 },
        { x: "Fri", y: 10, value: 90 },
        { x: "Sat", y: 10, value: 75 },
        { x: "Sun", y: 10, value: 65 },
      ],
    },
    {
      id: "Channel B",
      data: [
        { x: "Mon", y: 20, value: 40 },
        { x: "Tue", y: 20, value: 55 },
        { x: "Wed", y: 20, value: 65 },
        { x: "Thu", y: 20, value: 70 },
        { x: "Fri", y: 20, value: 85 },
        { x: "Sat", y: 20, value: 70 },
        { x: "Sun", y: 20, value: 50 },
      ],
    },
  ]

  if (authLoading || loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-thrive-500" />
        <p className="mt-4 text-lg text-muted-foreground">Loading dashboard data...</p>
      </div>
    )
  }

  if (dataError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-destructive">
        <XCircle className="h-12 w-12" />
        <p className="mt-4 text-lg font-medium">Error: {dataError}</p>
        <p className="text-sm text-muted-foreground">Please check your Shopify connection in settings.</p>
      </div>
    )
  }

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:grid-cols-5 xl:grid-cols-5">
        <div className="grid gap-4 sm:col-span-full lg:col-span-5">
          <MetricsCards
            totalProducts={overallMetrics?.totalProducts || 0}
            totalOrders={overallMetrics?.totalOrders || 0}
            totalRevenue={overallMetrics?.totalSales.toFixed(2) || "0.00"}
            lowStockCount={overallMetrics?.itemsNeedingRestock.length || 0}
          />
        </div>
        <InventoryHeatmap data={heatmapData} />
        <SyncMonitor
          totalSyncs={syncMetrics?.totalSyncs || 0}
          successRate={syncMetrics?.successRate || 0}
          avgLatency={syncMetrics?.avgLatency || 0}
          activeSyncs={syncMetrics?.activeSyncs || 0}
          errorCount={syncMetrics?.errorCount || 0}
          uptime={syncMetrics?.uptime || 0}
        />
        <AlertsPanel alerts={alerts} />
        <QuickActions />
      </div>
    </div>
  )
}
