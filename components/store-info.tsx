"use client"

import Link from "next/link"

import { useShopifyAuth } from "@/contexts/shopify-auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CircleDot, CircleOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function StoreInfo() {
  const {
    shopifyDomain,
    isConnected,
    loading,
    activeStoreKey,
    setActiveStore,
    store1Connected,
    store2Connected,
    store1Info,
    store2Info,
  } = useShopifyAuth()

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading stores...</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          {isConnected ? (
            <CircleDot className="h-4 w-4 text-thrive-500" />
          ) : (
            <CircleOff className="h-4 w-4 text-destructive" />
          )}
          <span className="hidden sm:inline">
            {isConnected ? `Connected: ${shopifyDomain?.split(".")[0] || "Shopify Store"}` : "Not Connected"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Active Store</DropdownMenuLabel>
        <DropdownMenuItem
          className={cn("flex items-center", activeStoreKey === "store1" && "font-semibold text-thrive-600")}
        >
          {store1Connected ? (
            <CircleDot className="h-4 w-4 mr-2 text-thrive-500" />
          ) : (
            <CircleOff className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          Store 1: {store1Info.domain ? store1Info.domain.split(".")[0] : "Not Connected"}
          {store1Connected && activeStoreKey !== "store1" && (
            <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setActiveStore("store1")}>
              Set Active
            </Button>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn("flex items-center", activeStoreKey === "store2" && "font-semibold text-thrive-600")}
        >
          {store2Connected ? (
            <CircleDot className="h-4 w-4 mr-2 text-thrive-500" />
          ) : (
            <CircleOff className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          Store 2: {store2Info.domain ? store2Info.domain.split(".")[0] : "Not Connected"}
          {store2Connected && activeStoreKey !== "store2" && (
            <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setActiveStore("store2")}>
              Set Active
            </Button>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">Manage Connections</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
