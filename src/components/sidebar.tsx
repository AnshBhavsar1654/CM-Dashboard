"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2.5 border-b px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Handshake className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold tracking-tight">CM Outreach</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">Gujarat CM Outreach</p>
      </div>
    </aside>
  )
}
