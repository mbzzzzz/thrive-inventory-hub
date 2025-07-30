"use client"

import { useState } from "react"
import { Bug, Play, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugPanel() {
  const [debugResult, setDebugResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDebugTest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/debug")
      const data = await response.json()
      setDebugResult(data)
    } catch (error) {
      setDebugResult({
        success: false,
        error: "Failed to run debug test",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Bug className="w-5 h-5" />
          Debug Panel - Test Your Store Connection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runDebugTest} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
            <Play className="w-4 h-4 mr-2" />
            {isLoading ? "Testing..." : "Test Store Connection"}
          </Button>

          {debugResult && (
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                {debugResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {debugResult.success ? "Connection Successful!" : "Connection Failed"}
                </span>
              </div>

              {debugResult.success ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Store:</strong> {debugResult.shop?.name}
                  </div>
                  <div>
                    <strong>Domain:</strong> {debugResult.shop?.domain}
                  </div>
                  <div>
                    <strong>Email:</strong> {debugResult.shop?.email}
                  </div>
                  <div>
                    <strong>Currency:</strong> {debugResult.shop?.currency}
                  </div>
                  <div>
                    <strong>Products Found:</strong> {debugResult.products?.count}
                  </div>

                  {debugResult.products?.sample?.length > 0 && (
                    <div>
                      <strong>Sample Products:</strong>
                      <ul className="ml-4 mt-1">
                        {debugResult.products.sample.map((product: any) => (
                          <li key={product.id}>
                            {product.title} ({product.variants} variants)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-600 text-sm">
                  <strong>Error:</strong> {debugResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
