import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ShopifyAuthContextProvider } from "@/contexts/shopify-auth-context"
import { InventoryContextProvider } from "@/contexts/inventory-context"
import { Navigation } from "@/components/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { MagnetLines } from "@/components/magnet-lines"
import "./magnet-lines.css" // Import the CSS for MagnetLines

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Thrive Inventory Hub",
  description: "Unified Inventory Management for Shopify Stores",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ShopifyAuthContextProvider>
            <InventoryContextProvider>
              <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <Navigation />
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                  <DashboardHeader />
                  <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">{children}</main>
                </div>
              </div>
              <Toaster />
            </InventoryContextProvider>
          </ShopifyAuthContextProvider>
          <MagnetLines />
        </ThemeProvider>
      </body>
    </html>
  )
}
