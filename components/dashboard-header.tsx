"use client"

import Link from "next/link"
import { Package2, Home, Package, ShoppingCart, Users, LineChart, Settings, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useShopifyAuth } from "@/contexts/shopify-auth-context"
import { StoreInfo } from "./store-info"

export function DashboardHeader() {
  const { isConnected, loading, activeStoreKey } = useShopifyAuth()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden bg-transparent">
            <Package2 className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-thrive-600 text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Thrive Inventory Hub</span>
            </Link>
            <Link href="/" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/inventory"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Package className="h-5 w-5" />
              Inventory
            </Link>
            <Link href="/orders" className="flex items-center gap-4 px-2.5 text-foreground">
              <ShoppingCart className="h-5 w-5" />
              Orders
              <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">6</Badge>
            </Link>
            <Link
              href="/invoices"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <FileText className="h-5 w-5" />
              Invoices
            </Link>
            <Link
              href="/customers"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Users className="h-5 w-5" />
              Customers
            </Link>
            <Link
              href="/reports"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <LineChart className="h-5 w-5" />
              Reports
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="relative ml-auto flex-1 md:grow-0">
        <StoreInfo />
      </div>
    </header>
  )
}
