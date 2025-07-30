"use client"

import { useInventory } from "@/contexts/inventory-context"

export function SyncMonitor() {
  const { metrics } = useInventory()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Sync Pulse Monitor</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Total Operations</span>
            <span className="font-bold text-slate-900">{metrics.totalSyncs.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Error Rate</span>
            <span className="font-bold text-red-600">{(100 - metrics.successRate).toFixed(2)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Queue Depth</span>
            <span className="font-bold text-blue-600">{metrics.activeSyncs}</span>
          </div>

          <div className="mt-6">
            <div className="text-sm text-slate-600 mb-2">System Heartbeat</div>
            <div className="h-16 bg-slate-50 rounded-lg flex items-center justify-center">
              <div className="flex items-center space-x-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-green-500 rounded transition-all duration-300 animate-pulse"
                    style={{
                      height: `${Math.random() * 24 + 8}px`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
