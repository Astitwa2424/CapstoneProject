import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { PollingProvider } from "@/components/customer/polling-provider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Foodhub",
  description: "Created By Astitwa Darsan Giri",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <PollingProvider>
            {children}
            <Toaster />
          </PollingProvider>
        </Providers>
      </body>
    </html>
  )
}
