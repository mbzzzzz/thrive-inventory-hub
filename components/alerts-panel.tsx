"use client"

import { AlertTriangle, CheckCircle, Activity, Info } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"

export function AlertsPanel() {
  const { alerts } = useInventory()

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return AlertTriangle
      case "success":
        return CheckCircle
      case "error":
        return AlertTriangle
      case "info":
        return Info
      default:
        return Activity
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning":
        return "text-yellow-500"
      case "success":
        return "text-green-500"
      case "error":
        return "text-red-500"
      case "info":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Live Alerts</h3>
      </div>
      <div className="p-6">
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {alerts.slice(0, 10).map((alert) => {
            const Icon = getAlertIcon(alert.type)
            return (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className={`w-4 h-4 ${getAlertColor(alert.type)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            )
          })}
          {alerts.length === 0 && <div className="text-center text-slate-500 py-4">No alerts at this time</div>}
        </div>
      </div>
    </div>
  )
}
