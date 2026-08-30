"use client"

import * as React from "react"

interface SidebarContextType {
  collapsed: boolean
  toggle: () => void
}

const SidebarContext = React.createContext<SidebarContextType>({
  collapsed: false,
  toggle: () => {},
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed") === "true"
    setCollapsed(stored)
    setMounted(true)
  }, [])

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("sidebar-collapsed", String(next))
      return next
    })
  }, [])

  return (
    <SidebarContext.Provider value={{ collapsed: mounted ? collapsed : false, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}
