"use client"

import { Settings, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInventory } from "@/contexts/inventory-context"

export function DashboardHeader() {
  const { refreshData, isLoading } = useInventory()

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Thrive Pets Inventory Hub</h1>
        <p className="text-slate-600">Real-time inventory synchronization across all channels</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-slate-700">System Online</span>
        </div>
        <Button onClick={refreshData} disabled={isLoading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  )
}
