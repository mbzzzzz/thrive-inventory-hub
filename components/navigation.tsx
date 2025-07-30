"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, ShoppingCart, FileText, BarChart3 } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/orders", label: "Orders", icon: ShoppingCart },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/reports", label: "Reports", icon: BarChart3 },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-slate-900">Thrive Pets</span>
            </Link>

            <div className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
