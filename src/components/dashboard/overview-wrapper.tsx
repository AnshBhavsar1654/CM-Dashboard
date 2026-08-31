"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { startOfMonth, endOfMonth } from "date-fns"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { ImageCarousel } from "@/components/dashboard/image-carousel"
import { DateFilterPopover } from "@/components/dashboard/date-filter-popover"
import type { EventData } from "@/lib/types"

export function OverviewWrapper({ events }: { events: EventData[] }) {
  const [dateRange, setDateRange] = React.useState<DateRange>()

  const filteredEvents = React.useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return events
    return events.filter(event => {
      const d = new Date(event.date)
      if (dateRange?.from && d < startOfMonth(dateRange.from)) return false
      if (dateRange?.to && d > endOfMonth(dateRange.to)) return false
      return true
    })
  }, [events, dateRange])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-sm text-muted-foreground">
            Key metrics and highlights from CM outreach activities.
          </p>
        </div>
        <DateFilterPopover dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <StatsGrid data={filteredEvents} />
        </div>
        <div className="lg:col-span-2">
          <ImageCarousel events={events} />
        </div>
      </div>
    </div>
  )
}
