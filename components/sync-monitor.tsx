"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { useInventory } from "@/contexts/inventory-context"
import { useToast } from "@/hooks/use-toast"

export function SyncMonitor() {
  const [skuToSync, setSkuToSync] = useState("")
  const [isSyncingSku, setIsSyncingSku] = useState(false)
  const [isBulkSyncing, setIsBulkSyncing] = useState(false)
  const { syncSKU, bulkSync, error } = useInventory()
  const { toast } = useToast()

  const handleSyncSku = async () => {
    if (!skuToSync) {
      toast({
        title: "Input Required",
        description: "Please enter an SKU to sync.",
        variant: "destructive",
      })
      return
    }
    setIsSyncingSku(true)
    const success = await syncSKU(skuToSync)
    setIsSyncingSku(false)
    if (success) {
      setSkuToSync("") // Clear input on success
    }
  }

  const handleBulkSync = async () => {
    setIsBulkSyncing(true)
    await bulkSync()
    setIsBulkSyncing(false)
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Inventory Sync</CardTitle>
        <CardDescription>Monitor and manually trigger inventory synchronization.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="sku-sync">Sync Single SKU</Label>
          <div className="flex gap-2">
            <Input
              id="sku-sync"
              placeholder="Enter SKU"
              value={skuToSync}
              onChange={(e) => setSkuToSync(e.target.value)}
              disabled={isSyncingSku || isBulkSyncing || !!error}
            />
            <Button onClick={handleSyncSku} disabled={isSyncingSku || isBulkSyncing || !!error}>
              {isSyncingSku ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="sr-only sm:not-sr-only ml-1">Sync SKU</span>
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive flex items-center">
              <XCircle className="h-4 w-4 mr-1" /> Sync disabled due to connection error.
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label>Bulk Sync All Inventory</Label>
          <Button onClick={handleBulkSync} disabled={isBulkSyncing || isSyncingSku || !!error}>
            {isBulkSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="sr-only sm:not-sr-only ml-1">Perform Bulk Sync</span>
          </Button>
          <p className="text-sm text-muted-foreground">This will fetch and update all inventory data from Shopify.</p>
        </div>
        <div className="grid gap-2">
          <Label>Last Sync Status</Label>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {error ? (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-destructive">Failed to sync: {error}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-thrive-500" />
                <span>Last sync: Just now (simulated)</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
