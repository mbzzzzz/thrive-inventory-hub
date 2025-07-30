"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface InventoryItem {
  sku: string
  productTitle: string
  variantTitle: string
  inventoryItemId: string
  channels: {
    name: string
    quantity: number
    lastSync: number
    status: "synced" | "error" | "pending"
    syncLatency: number
  }[]
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
  type: "warning" | "success" | "info" | "error"
  message: string
  timestamp: number
}

interface InventoryContextType {
  inventory: InventoryItem[]
  metrics: SyncMetrics
  alerts: Alert[]
  isLoading: boolean
  syncSKU: (sku: string) => Promise<void>
  bulkSync: () => Promise<void>
  refreshData: () => Promise<void>
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [metrics, setMetrics] = useState<SyncMetrics>({
    totalSyncs: 0,
    successRate: 0,
    avgLatency: 0,
    activeSyncs: 0,
    errorCount: 0,
    uptime: 0,
  })
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchInventoryData = async () => {
    try {
      const response = await fetch("/api/inventory")
      if (!response.ok) throw new Error("Failed to fetch inventory")

      const data = await response.json()
      setInventory(data.inventory)
      setMetrics(data.metrics)
      setAlerts(data.alerts)
    } catch (error) {
      console.error("Error fetching inventory:", error)
      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "error",
          message: "Failed to fetch inventory data",
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const syncSKU = async (sku: string) => {
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      })

      if (!response.ok) throw new Error("Sync failed")

      const result = await response.json()
      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "success",
          message: `${sku} synchronized successfully`,
          timestamp: Date.now(),
        },
      ])

      await fetchInventoryData()
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "error",
          message: `Failed to sync ${sku}`,
          timestamp: Date.now(),
        },
      ])
    }
  }

  const bulkSync = async () => {
    try {
      const response = await fetch("/api/sync/bulk", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Bulk sync failed")

      const result = await response.json()
      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "success",
          message: `Bulk sync completed: ${result.updatedItems} items updated`,
          timestamp: Date.now(),
        },
      ])

      await fetchInventoryData()
    } catch (error) {
      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "error",
          message: "Bulk sync failed",
          timestamp: Date.now(),
        },
      ])
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    await fetchInventoryData()
  }

  useEffect(() => {
    fetchInventoryData()

    // Set up real-time updates
    const interval = setInterval(fetchInventoryData, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        metrics,
        alerts,
        isLoading,
        syncSKU,
        bulkSync,
        refreshData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}
