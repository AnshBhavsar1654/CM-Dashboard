"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/sidebar-provider"
import { SidebarStats } from "@/components/sidebar-stats"
import {
  LayoutDashboard,
  Map,
  PieChart,
  TrendingUp,
  Table2,
  Handshake,
} from "lucide-react"

const navItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/map", label: "Map View", icon: Map },
  { href: "/distribution", label: "Event Distribution", icon: PieChart },
  { href: "/trends", label: "Monthly Trends", icon: TrendingUp },
  { href: "/events", label: "Events Table", icon: Table2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed } = useSidebar()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* ── Logo ── */}
      <div className={cn(
        "flex h-14 shrink-0 items-center border-b border-sidebar-border",
        collapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Handshake className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap">
              CM Outreach
            </span>
          )}
        </div>
      </div>

      {/* ── Context Stats ── */}
      {!collapsed && (
        <div className="border-b border-sidebar-border px-4 py-3">
          <SidebarStats />
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center rounded-md text-sm font-medium outline-none",
                "transition-colors duration-150",
                collapsed ? "justify-center h-10" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              {/* Left accent bar */}
              {isActive && (
                <span
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full bg-sidebar-primary",
                    "transition-all duration-300 ease-in-out",
                    collapsed ? "h-5 w-[3px]" : "h-6 w-[3px]"
                  )}
                />
              )}

              <item.icon className={cn(
                "h-4 w-4 shrink-0 transition-colors duration-150",
                isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
              )} />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-sidebar-border">
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent">
              <span className="text-[10px] font-semibold text-sidebar-foreground/70">IN</span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-sidebar-foreground truncate">Republic of India</p>
                <p className="text-[10px] text-sidebar-foreground/50 truncate">Government of Gujarat</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
