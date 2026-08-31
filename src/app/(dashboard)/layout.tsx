"use client"

import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SidebarProvider, useSidebar } from "@/components/sidebar-provider"

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className="transition-[padding-left] duration-300 ease-in-out"
        style={{ paddingLeft: collapsed ? '4rem' : '15rem' }}
      >
        <DashboardHeader />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </SidebarProvider>
  )
}
