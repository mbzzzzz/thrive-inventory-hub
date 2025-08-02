"use client"

import Link from "next/link"
import { Home, Package, ShoppingCart, Users, LineChart, Settings, Package2, FileText } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/inventory", icon: Package, label: "Inventory" },
    { href: "/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/invoices", icon: FileText, label: "Invoices" },
    { href: "/customers", icon: Users, label: "Customers" },
    { href: "/reports", icon: LineChart, label: "Reports" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-thrive-600 text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Thrive Inventory Hub</span>
        </Link>
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  )
}
