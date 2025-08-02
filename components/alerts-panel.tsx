"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingDown, CheckCircle2 } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"

export function AlertsPanel() {
  const { reportMetrics, loadingReports, error } = useInventory()

  if (loadingReports) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Alerts & Notifications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="grid gap-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="grid gap-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !reportMetrics) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Alerts & Notifications</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8 text-destructive">
          <AlertCircle className="h-10 w-10 mb-4" />
          <p className="text-lg">Error loading alerts: {error}</p>
          <p className="text-sm text-muted-foreground mt-2">Please check your Shopify connection.</p>
        </CardContent>
      </Card>
    )
  }

  const itemsNeedingRestock = reportMetrics.itemsNeedingRestock || []
  const hasAlerts = itemsNeedingRestock.length > 0

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Alerts & Notifications</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {hasAlerts ? (
          itemsNeedingRestock.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <div className="grid gap-1">
                <p className="text-sm font-medium">Low Stock Alert: {item.title}</p>
                <p className="text-xs text-muted-foreground">
                  SKU: {item.sku} - Current Stock: {item.currentStock}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <CheckCircle2 className="h-6 w-6 text-thrive-500" />
            <p className="text-sm">No critical alerts at this time. All good!</p>
          </div>
        )}
        {/* Example of a potential future alert */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <TrendingDown className="h-6 w-6" />
          <div className="grid gap-1">
            <p className="text-sm font-medium">Sales Trend: Monitoring</p>
            <p className="text-xs text-muted-foreground">Sales are stable compared to last week.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
