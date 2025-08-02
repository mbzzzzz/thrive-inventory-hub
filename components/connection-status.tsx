"use client"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

interface ConnectionStatusProps {
  shopifyDomain: string | null
  shopifyAccessToken: string | null
  isConnected: boolean
  loading: boolean
  activeStoreKey: string | null
}

export function ConnectionStatus({ shopifyDomain, isConnected, loading, activeStoreKey }: ConnectionStatusProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-thrive-500" />
        <span className="ml-2 text-muted-foreground">Checking connection...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      {isConnected ? (
        <CheckCircle2 className="h-8 w-8 text-thrive-500" />
      ) : (
        <XCircle className="h-8 w-8 text-destructive" />
      )}
      <div>
        <p className="text-lg font-semibold">{isConnected ? "Connected" : "Not Connected"}</p>
        <p className="text-sm text-muted-foreground">
          {isConnected
            ? `Active Store: ${activeStoreKey?.toUpperCase()} (${shopifyDomain?.split(".")[0]})`
            : "No Shopify store is currently active."}
        </p>
      </div>
    </div>
  )
}
