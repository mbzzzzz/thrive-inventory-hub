"use client"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetricsCards } from "@/components/metrics-cards"
import { InventoryHeatmap } from "@/components/inventory-heatmap"
import { SyncMonitor } from "@/components/sync-monitor"
import { AlertsPanel } from "@/components/alerts-panel"
import { QuickActions } from "@/components/quick-actions"
import { InventoryProvider } from "@/contexts/inventory-context"
import { ConnectionStatus } from "@/components/connection-status"
import { DebugPanel } from "@/components/debug-panel"
import { StoreInfo } from "@/components/store-info"

export default function Dashboard() {
  return (
    <InventoryProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto p-6">
          <DashboardHeader />
          <DebugPanel />
          <StoreInfo />
          <ConnectionStatus />
          <MetricsCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              <InventoryHeatmap />
            </div>

            <div className="space-y-6">
              <SyncMonitor />
              <AlertsPanel />
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </InventoryProvider>
  )
}
