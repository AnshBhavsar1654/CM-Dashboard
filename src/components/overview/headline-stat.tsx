"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendSparkline } from "@/components/overview/trend-sparkline"
import type { EventData } from "@/lib/types"

interface HeadlineStatProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  allEvents: EventData[]
  filteredEvents: EventData[]
  filterFn?: (event: EventData) => boolean
  accent?: string
}

export function HeadlineStat({ title, value, subtitle, icon: Icon, allEvents, filteredEvents: _filteredEvents, filterFn, accent: _accent }: HeadlineStatProps) {
  return (
    <Card className="relative h-full">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md bg-muted"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
          </div>
          <TrendSparkline events={allEvents} filterFn={filterFn} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-headline font-semibold text-foreground tabular-nums">
            {typeof value === "number" ? value.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : value}
          </span>
          {subtitle && (
            <span className="text-sm text-muted-foreground">{subtitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
