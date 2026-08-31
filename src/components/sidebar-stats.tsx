"use client"

import * as React from "react"
import { getSidebarStats } from "@/app/actions"

interface SidebarStatsData {
  eventsThisMonth: number
  districtsCovered: number
  districtsRemaining: number
  totalDistricts: number
}

export function SidebarStats() {
  const [stats, setStats] = React.useState<SidebarStatsData | null>(null)

  React.useEffect(() => {
    getSidebarStats().then(setStats).catch(() => {})
  }, [])

  if (!stats) {
    return (
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-medium text-sidebar-foreground/50 uppercase tracking-wider">
            This month
          </span>
          <span className="h-5 w-8 animate-pulse rounded bg-sidebar-accent" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-medium text-sidebar-foreground/50 uppercase tracking-wider">
            Districts left
          </span>
          <span className="h-5 w-12 animate-pulse rounded bg-sidebar-accent" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-medium text-sidebar-foreground/50 uppercase tracking-wider">
          This month
        </span>
        <span className="text-lg font-headline font-semibold text-sidebar-foreground tabular-nums">
          {stats.eventsThisMonth}
        </span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-medium text-sidebar-foreground/50 uppercase tracking-wider">
          Districts left
        </span>
        <span className="text-lg font-headline font-semibold text-sidebar-foreground tabular-nums">
          {stats.districtsRemaining}
          <span className="text-[10px] font-normal text-sidebar-foreground/40 ml-0.5">
            /{stats.totalDistricts}
          </span>
        </span>
      </div>
    </div>
  )
}
