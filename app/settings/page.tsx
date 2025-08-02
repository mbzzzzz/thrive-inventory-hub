"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useShopifyAuth } from "@/contexts/shopify-auth-context"
import { Loader2 } from "lucide-react"
import { ConnectionStatus } from "@/components/connection-status"
import { StoreConnectForm } from "@/components/store-connect-form"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const {
    shopifyDomain,
    shopifyAccessToken,
    activeStoreKey,
    isConnected,
    loading: authLoading,
    connectStore,
    disconnectStore,
    setActiveStore,
    store1Connected,
    store2Connected,
    store1Info,
    store2Info,
  } = useShopifyAuth()
  const [loadingConnection, setLoadingConnection] = useState(false)
  const { toast } = useToast()

  const handleConnect = async (storeKey: string, domain: string, accessToken: string) => {
    setLoadingConnection(true)
    const success = await connectStore(storeKey, domain, accessToken)
    setLoadingConnection(false)
    return success
  }

  const handleDisconnect = (storeKey: string) => {
    disconnectStore(storeKey)
  }

  const handleSetActive = (storeKey: string) => {
    setActiveStore(storeKey)
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-thrive-500" />
        <p className="mt-4 text-lg text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shopify Store Connections</CardTitle>
            <CardDescription>Connect and manage your Shopify stores.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Store 1</h3>
              <StoreConnectForm
                storeKey="store1"
                initialDomain={store1Info.domain || ""}
                initialAccessToken={store1Info.accessToken || ""}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onSetActive={handleSetActive}
                isConnected={store1Connected}
                isActive={activeStoreKey === "store1"}
                loading={loadingConnection}
              />
            </div>
            <Separator />
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Store 2 (Optional)</h3>
              <StoreConnectForm
                storeKey="store2"
                initialDomain={store2Info.domain || ""}
                initialAccessToken={store2Info.accessToken || ""}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onSetActive={handleSetActive}
                isConnected={store2Connected}
                isActive={activeStoreKey === "store2"}
                loading={loadingConnection}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Active Store</CardTitle>
            <CardDescription>The Shopify store currently active for data fetching.</CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectionStatus
              shopifyDomain={shopifyDomain}
              shopifyAccessToken={shopifyAccessToken}
              isConnected={isConnected}
              loading={authLoading}
              activeStoreKey={activeStoreKey}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Branding</CardTitle>
            <CardDescription>Customize the branding for your PDF invoices.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="Thrive Inventory Hub" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyLogo">Company Logo URL</Label>
              <Input id="companyLogo" placeholder="https://example.com/logo.png" />
              <p className="text-sm text-muted-foreground">
                Provide a direct URL to your company logo. This will appear on invoices.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accentColor">Accent Color (Hex)</Label>
              <Input id="accentColor" placeholder="#22c55e" />
              <p className="text-sm text-muted-foreground">
                Choose a hex color for accents on your invoices (e.g., borders, highlights).
              </p>
            </div>
            <Button>Save Branding Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
