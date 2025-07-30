"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ConnectionStatus {
  success: boolean
  store?: string
  shopName?: string
  error?: string
}

export function ConnectionStatus() {
  const [status, setStatus] = useState<{
    primary: ConnectionStatus | null
    outlet: ConnectionStatus | null
    environment?: any
  }>({
    primary: null,
    outlet: null,
  })
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test-connection")
      const data = await response.json()

      if (data.success) {
        setStatus({
          primary: data.stores.primary,
          outlet: data.stores.outlet,
          environment: data.environment,
        })
      } else {
        console.error("Connection test failed:", data.error)
        setStatus({
          primary: { success: false, error: data.error },
          outlet: { success: false, error: data.error },
          environment: data.environment,
        })
      }
    } catch (error) {
      console.error("Failed to test connection:", error)
      setStatus({
        primary: { success: false, error: "Network error" },
        outlet: { success: false, error: "Network error" },
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  const getStatusIcon = (connectionStatus: ConnectionStatus | null) => {
    if (!connectionStatus) return <AlertCircle className="w-5 h-5 text-gray-500" />
    if (connectionStatus.success) return <CheckCircle className="w-5 h-5 text-green-500" />
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  const getStatusText = (connectionStatus: ConnectionStatus | null) => {
    if (!connectionStatus) return "Testing..."
    if (connectionStatus.success) return `Connected to ${connectionStatus.shopName}`
    return `Error: ${connectionStatus.error}`
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Shopify Connection Status
          <Button onClick={testConnection} disabled={isLoading} size="sm" variant="outline">
            {isLoading ? "Testing..." : "Test Connection"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Environment Variables Check */}
          {status.environment && (
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Environment Variables:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(status.environment).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    {value ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span className={value ? "text-green-700" : "text-red-700"}>{key}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Store Connections */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.primary)}
              <div className="flex-1">
                <div className="font-medium">Primary Store</div>
                <div className="text-sm text-slate-600">{getStatusText(status.primary)}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {getStatusIcon(status.outlet)}
              <div className="flex-1">
                <div className="font-medium">Outlet Store</div>
                <div className="text-sm text-slate-600">{getStatusText(status.outlet)}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
