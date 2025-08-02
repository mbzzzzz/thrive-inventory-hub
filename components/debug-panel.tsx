"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, BugPlay } from "lucide-react"

export function DebugPanel() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDebugData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/debug")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setDebugData(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch debug data.")
      console.error("Error fetching debug data:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BugPlay className="h-5 w-5" /> Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button onClick={fetchDebugData} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Fetch Debug Info
        </Button>
        {error && <p className="text-destructive">Error: {error}</p>}
        {debugData && (
          <div className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
            <pre>{JSON.stringify(debugData, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
