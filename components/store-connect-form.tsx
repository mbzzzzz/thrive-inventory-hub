"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

interface StoreConnectFormProps {
  storeKey: string
  initialDomain: string
  initialAccessToken: string
  onConnect: (storeKey: string, domain: string, accessToken: string) => Promise<boolean>
  onDisconnect: (storeKey: string) => void
  onSetActive: (storeKey: string) => void
  isConnected: boolean
  isActive: boolean
  loading: boolean
}

export function StoreConnectForm({
  storeKey,
  initialDomain,
  initialAccessToken,
  onConnect,
  onDisconnect,
  onSetActive,
  isConnected,
  isActive,
  loading,
}: StoreConnectFormProps) {
  const [domain, setDomain] = useState(initialDomain)
  const [accessToken, setAccessToken] = useState(initialAccessToken)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnectClick = async () => {
    setIsConnecting(true)
    const success = await onConnect(storeKey, domain, accessToken)
    setIsConnecting(false)
    if (!success) {
      // If connection failed, clear inputs to prompt user to re-enter
      setDomain("")
      setAccessToken("")
    }
  }

  const handleDisconnectClick = () => {
    onDisconnect(storeKey)
    setDomain("")
    setAccessToken("")
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`${storeKey}-domain`}>Shopify Domain</Label>
        <Input
          id={`${storeKey}-domain`}
          placeholder="your-store.myshopify.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          disabled={isConnected || loading || isConnecting}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${storeKey}-access-token`}>Shopify Access Token</Label>
        <Input
          id={`${storeKey}-access-token`}
          type="password"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          disabled={isConnected || loading || isConnecting}
        />
      </div>
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-thrive-500" />
            <span className="text-thrive-600 font-medium">Connected</span>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5 text-destructive" />
            <span className="text-destructive font-medium">Not Connected</span>
          </>
        )}
        {isActive && (
          <Badge variant="secondary" className="ml-2">
            Active
          </Badge>
        )}
      </div>
      <div className="flex gap-2">
        {!isConnected ? (
          <Button
            onClick={handleConnectClick}
            disabled={!domain || !accessToken || loading || isConnecting}
            className="w-full"
          >
            {isConnecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Connect
          </Button>
        ) : (
          <>
            <Button
              onClick={handleDisconnectClick}
              variant="outline"
              disabled={loading || isConnecting}
              className="w-full bg-transparent"
            >
              Disconnect
            </Button>
            {!isActive && (
              <Button onClick={() => onSetActive(storeKey)} disabled={loading || isConnecting} className="w-full">
                Set Active
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
