"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

interface SidebarContextType {
  /** Desktop rail collapsed state (always false on mobile, where the sidebar is a drawer). */
  collapsed: boolean
  isMobile: boolean
  mobileOpen: boolean
  toggle: () => void
  closeMobile: () => void
}

const SidebarContext = React.createContext<SidebarContextType>({
  collapsed: false,
  isMobile: false,
  mobileOpen: false,
  toggle: () => {},
  closeMobile: () => {},
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const isMobile = useIsMobile()
  const pathname = usePathname()

  React.useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("sidebar-collapsed") === "true")
    } catch {}
    setMounted(true)
  }, [])

  // Close the mobile drawer after navigating
  React.useEffect(() => { setMobileOpen(false) }, [pathname])

  const toggle = React.useCallback(() => {
    if (isMobile) {
      setMobileOpen((o) => !o)
      return
    }
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem("sidebar-collapsed", String(next)) } catch {}
      return next
    })
  }, [isMobile])

  const closeMobile = React.useCallback(() => setMobileOpen(false), [])

  const value = React.useMemo(
    () => ({
      collapsed: mounted && !isMobile ? collapsed : false,
      isMobile,
      mobileOpen,
      toggle,
      closeMobile,
    }),
    [mounted, isMobile, collapsed, mobileOpen, toggle, closeMobile]
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}
