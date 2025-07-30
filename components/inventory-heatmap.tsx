"use client"

import { Package, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInventory } from "@/contexts/inventory-context"

export function InventoryHeatmap() {
  const { inventory, syncSKU, isLoading } = useInventory()

  const getStockStatus = (quantity: number) => {
    if (quantity < 50) return "critical"
    if (quantity < 150) return "warning"
    return "healthy"
  }

  const getStockColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Live Inventory Heatmap</h2>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-slate-600">Auto-refresh: 30s</div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {inventory.map((item) => (
            <div key={item.sku} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-slate-500" />
                  <div>
                    <span className="font-semibold text-slate-900">{item.sku}</span>
                    <p className="text-sm text-slate-600">{item.productTitle}</p>
                  </div>
                </div>
                <Button
                  onClick={() => syncSKU(item.sku)}
                  disabled={isLoading}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Sync Now"}
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {item.channels.map((channel) => {
                  const stockStatus = getStockStatus(channel.quantity)
                  return (
                    <div key={channel.name} className="text-center">
                      <div className="text-xs font-medium text-slate-600 mb-1">{channel.name}</div>
                      <div className={`p-2 rounded-lg border text-sm font-bold ${getStockColor(stockStatus)}`}>
                        {channel.quantity}
                      </div>
                      <div className="flex items-center justify-center mt-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            channel.status === "synced"
                              ? "bg-green-500"
                              : channel.status === "error"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                        ></div>
                        <span className="text-xs text-slate-500 ml-1">{channel.syncLatency}ms</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
