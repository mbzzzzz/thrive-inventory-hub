"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface ShopifyAuthContextType {
  shopifyDomain: string | null
  shopifyAccessToken: string | null
  activeStoreKey: string | null
  isConnected: boolean
  loading: boolean
  connectStore: (storeKey: string, domain: string, accessToken: string) => Promise<boolean>
  disconnectStore: (storeKey: string) => void
  setActiveStore: (storeKey: string) => void
  getStoreInfo: (storeKey: string) => { domain: string | null; accessToken: string | null }
  store1Connected: boolean
  store2Connected: boolean
  store1Info: { domain: string | null; accessToken: string | null }
  store2Info: { domain: string | null; accessToken: string | null }
}

const ShopifyAuthContext = createContext<ShopifyAuthContextType | undefined>(undefined)

export function ShopifyAuthContextProvider({ children }: { children: React.ReactNode }) {
  const [shopifyDomain, setShopifyDomain] = useState<string | null>(null)
  const [shopifyAccessToken, setShopifyAccessToken] = useState<string | null>(null)
  const [activeStoreKey, setActiveStoreKey] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [store1Connected, setStore1Connected] = useState(false)
  const [store2Connected, setStore2Connected] = useState(false)
  const [store1Info, setStore1Info] = useState<{ domain: string | null; accessToken: string | null }>({
    domain: null,
    accessToken: null,
  })
  const [store2Info, setStore2Info] = useState<{ domain: string | null; accessToken: string | null }>({
    domain: null,
    accessToken: null,
  })
  const { toast } = useToast()

  const getStoreInfo = useCallback((storeKey: string) => {
    if (typeof window === "undefined") return { domain: null, accessToken: null }
    const domain = localStorage.getItem(`${storeKey}_shopify_domain`)
    const accessToken = localStorage.getItem(`${storeKey}_shopify_access_token`)
    return { domain, accessToken }
  }, [])

  const loadInitialState = useCallback(() => {
    setLoading(true)
    if (typeof window !== "undefined") {
      const activeKey = localStorage.getItem("active_shopify_store_key")
      setActiveStoreKey(activeKey)

      const { domain: domain1, accessToken: token1 } = getStoreInfo("store1")
      const { domain: domain2, accessToken: token2 } = getStoreInfo("store2")

      setStore1Info({ domain: domain1, accessToken: token1 })
      setStore2Info({ domain: domain2, accessToken: token2 })

      setStore1Connected(!!domain1 && !!token1)
      setStore2Connected(!!domain2 && !!token2)

      if (activeKey) {
        const { domain, accessToken } = getStoreInfo(activeKey)
        if (domain && accessToken) {
          setShopifyDomain(domain)
          setShopifyAccessToken(accessToken)
          setIsConnected(true)
        } else {
          setIsConnected(false)
          setActiveStoreKey(null)
          localStorage.removeItem("active_shopify_store_key")
        }
      } else {
        setIsConnected(false)
      }
    }
    setLoading(false)
  }, [getStoreInfo])

  useEffect(() => {
    loadInitialState()
  }, [loadInitialState])

  const connectStore = useCallback(
    async (storeKey: string, domain: string, accessToken: string) => {
      if (typeof window === "undefined") return false
      try {
        const response = await fetch("/api/test-connection", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ domain, accessToken }),
        })

        const data = await response.json()

        if (data.success) {
          localStorage.setItem(`${storeKey}_shopify_domain`, domain)
          localStorage.setItem(`${storeKey}_shopify_access_token`, accessToken)
          if (storeKey === "store1") {
            setStore1Connected(true)
            setStore1Info({ domain, accessToken })
          } else if (storeKey === "store2") {
            setStore2Connected(true)
            setStore2Info({ domain, accessToken })
          }
          toast({
            title: "Store Connected",
            description: `${data.shopName || "Shopify Store"} connected successfully!`,
            variant: "success",
          })
          // If no active store, set this one as active
          if (!activeStoreKey) {
            setActiveStoreKey(storeKey)
            setShopifyDomain(domain)
            setShopifyAccessToken(accessToken)
            setIsConnected(true)
          }
          return true
        } else {
          toast({
            title: "Connection Failed",
            description: data.error || "Could not connect to Shopify. Check credentials.",
            variant: "destructive",
          })
          return false
        }
      } catch (error: any) {
        console.error("Connection error:", error)
        toast({
          title: "Connection Error",
          description: error.message || "An unexpected error occurred during connection.",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  const disconnectStore = useCallback(
    (storeKey: string) => {
      if (typeof window === "undefined") return
      localStorage.removeItem(`${storeKey}_shopify_domain`)
      localStorage.removeItem(`${storeKey}_shopify_access_token`)
      if (storeKey === "store1") {
        setStore1Connected(false)
        setStore1Info({ domain: null, accessToken: null })
      } else if (storeKey === "store2") {
        setStore2Connected(false)
        setStore2Info({ domain: null, accessToken: null })
      }
      if (activeStoreKey === storeKey) {
        setActiveStoreKey(null)
        setShopifyDomain(null)
        setShopifyAccessToken(null)
        setIsConnected(false)
        localStorage.removeItem("active_shopify_store_key")
        toast({
          title: "Store Disconnected",
          description: `Store ${storeKey.toUpperCase()} has been disconnected.`,
          variant: "default",
        })
      } else {
        toast({
          title: "Store Disconnected",
          description: `Store ${storeKey.toUpperCase()} has been disconnected.`,
          variant: "default",
        })
      }
    },
    [activeStoreKey, toast],
  )

  const setActiveStore = useCallback(
    (storeKey: string) => {
      if (typeof window === "undefined") return
      const { domain, accessToken } = getStoreInfo(storeKey)
      if (domain && accessToken) {
        localStorage.setItem("active_shopify_store_key", storeKey)
        setActiveStoreKey(storeKey)
        setShopifyDomain(domain)
        setShopifyAccessToken(accessToken)
        setIsConnected(true)
        toast({
          title: "Active Store Set",
          description: `Switched to Store ${storeKey.toUpperCase()}.`,
          variant: "success",
        })
      } else {
        toast({
          title: "Activation Failed",
          description: `Store ${storeKey.toUpperCase()} is not connected. Please connect it first.`,
          variant: "destructive",
        })
      }
    },
    [getStoreInfo, toast],
  )

  const value = React.useMemo(
    () => ({
      shopifyDomain,
      shopifyAccessToken,
      activeStoreKey,
      isConnected,
      loading,
      connectStore,
      disconnectStore,
      setActiveStore,
      getStoreInfo,
      store1Connected,
      store2Connected,
      store1Info,
      store2Info,
    }),
    [
      shopifyDomain,
      shopifyAccessToken,
      activeStoreKey,
      isConnected,
      loading,
      connectStore,
      disconnectStore,
      setActiveStore,
      getStoreInfo,
      store1Connected,
      store2Connected,
      store1Info,
      store2Info,
    ],
  )

  return <ShopifyAuthContext.Provider value={value}>{children}</ShopifyAuthContext.Provider>
}

export function useShopifyAuth() {
  const context = useContext(ShopifyAuthContext)
  if (context === undefined) {
    throw new Error("useShopifyAuth must be used within a ShopifyAuthContextProvider")
  }
  return context
}
