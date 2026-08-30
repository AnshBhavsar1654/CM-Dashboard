"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/sidebar-provider"
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
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className={cn("flex h-14 items-center gap-2.5 border-b", collapsed ? "justify-center px-2" : "px-5")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Handshake className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight whitespace-nowrap">CM Outreach</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center h-10" : "gap-3 px-3 py-2",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">Gujarat CM Outreach</p>
        </div>
      )}
    </aside>
  )
}
