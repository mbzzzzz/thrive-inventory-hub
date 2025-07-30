"use client"

import { useState, useEffect } from "react"
import { Store, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StoreInfo {
  key: string
  name: string
  domain: string
  success: boolean
  shopName?: string
  error?: string
}

export function StoreInfo() {
  const [storeInfo, setStoreInfo] = useState<{
    stores: StoreInfo[]
    activeStores: number
    totalStores: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStoreInfo = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/stores/info")
      if (response.ok) {
        const data = await response.json()
        // Ensure stores is always an array
        setStoreInfo({
          stores: data.stores || [],
          activeStores: data.activeStores || 0,
          totalStores: data.totalStores || 0,
        })
      } else {
        setError("Failed to fetch store information")
      }
    } catch (error) {
      console.error("Failed to fetch store info:", error)
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStoreInfo()
  }, [])

  if (error) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-red-600">
            <div className="font-medium">Error loading store information</div>
            <div className="text-sm">{error}</div>
            <Button onClick={fetchStoreInfo} className="mt-2 bg-transparent" size="sm" variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!storeInfo) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Connected Stores ({storeInfo.activeStores}/{storeInfo.totalStores})
          </div>
          <Button onClick={fetchStoreInfo} disabled={isLoading} size="sm" variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {storeInfo.stores && storeInfo.stores.length > 0 ? (
            storeInfo.stores.map((store) => (
              <div key={store.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {store.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">{store.shopName || store.name}</div>
                    <div className="text-sm text-slate-600">{store.domain}</div>
                    {store.error && <div className="text-sm text-red-600">{store.error}</div>}
                  </div>
                </div>
                <Badge variant={store.success ? "default" : "destructive"}>
                  {store.success ? "Connected" : "Error"}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-slate-500">No store configurations found</div>
          )}
        </div>

        {storeInfo.activeStores === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-yellow-800 font-medium">No stores connected</div>
            <div className="text-yellow-700 text-sm">
              Please check your environment variables and ensure at least one store is properly configured.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
