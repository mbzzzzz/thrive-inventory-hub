"use client"

import { Activity, CheckCircle, Cpu, TrendingUp, Zap } from "lucide-react"
import { useInventory } from "@/contexts/inventory-context"

export function MetricsCards() {
  const { metrics } = useInventory()

  const cards = [
    {
      title: "Sync Success Rate",
      value: `${metrics.successRate.toFixed(3)}%`,
      icon: CheckCircle,
      color: "green",
      trend: "+0.02% from last hour",
    },
    {
      title: "Avg Sync Latency",
      value: `${metrics.avgLatency}ms`,
      icon: Zap,
      color: "blue",
      trend: "Target: <500ms",
    },
    {
      title: "Active Syncs",
      value: metrics.activeSyncs.toString(),
      icon: Activity,
      color: "purple",
      trend: "Real-time processing",
    },
    {
      title: "System Uptime",
      value: `${metrics.uptime}%`,
      icon: Cpu,
      color: "emerald",
      trend: "Multi-region active",
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      green: "text-green-600 bg-green-100",
      blue: "text-blue-600 bg-blue-100",
      purple: "text-purple-600 bg-purple-100",
      emerald: "text-emerald-600 bg-emerald-100",
    }
    return colors[color as keyof typeof colors] || colors.green
  }

  const getTrendColor = (color: string) => {
    const colors = {
      green: "text-green-600",
      blue: "text-blue-600",
      purple: "text-purple-600",
      emerald: "text-emerald-600",
    }
    return colors[color as keyof typeof colors] || colors.green
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">{card.title}</p>
              <p className={`text-3xl font-bold ${getTrendColor(card.color)}`}>{card.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
          <div className={`mt-4 flex items-center text-sm ${getTrendColor(card.color)}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {card.trend}
          </div>
        </div>
      ))}
    </div>
  )
}
