"use client"

import { Database, Eye, BarChart3, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInventory } from "@/contexts/inventory-context"
import Link from "next/link"

export function QuickActions() {
  const { bulkSync } = useInventory()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          <Button onClick={bulkSync} className="w-full bg-indigo-600 hover:bg-indigo-700">
            <Database className="w-4 h-4 mr-2" />
            Bulk Inventory Sync
          </Button>

          <Link href="/invoices" className="block">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              <DollarSign className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </Link>

          <Link href="/reports" className="block">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </Link>

          <Link href="/audit" className="block">
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              <Eye className="w-4 h-4 mr-2" />
              Audit Trail
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
