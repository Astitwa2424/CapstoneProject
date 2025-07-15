import type { ReactNode } from "react"

// This layout is now very simple and just passes children through.
// The main header is handled by the parent layout in /customer/layout.tsx
export default function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
