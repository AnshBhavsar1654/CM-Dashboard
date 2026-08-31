"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { startOfMonth, endOfMonth } from "date-fns"
import { Layers, Route, MapPin } from "lucide-react"
import { HeadlineStat } from "@/components/overview/headline-stat"
import { DistrictCoverageRing } from "@/components/overview/district-coverage-ring"
import { CategoryBreakdown } from "@/components/overview/category-breakdown"
import { PhotoCarousel } from "@/components/overview/photo-carousel"
import { DateFilterPopover } from "@/components/common/date-filter-popover"
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

  const totalDistance = React.useMemo(
    () => filteredEvents.reduce((sum, e) => sum + e.distanceTravelled, 0),
    [filteredEvents]
  )

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

      {/* Top 3 headline stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HeadlineStat
          title="Total Events"
          value={filteredEvents.length}
          icon={Layers}
          allEvents={events}
          filteredEvents={filteredEvents}
        />
        <HeadlineStat
          title="Distance Traveled"
          value={`${Math.round(totalDistance).toLocaleString("en-IN")} km`}
          subtitle="total"
          icon={Route}
          allEvents={events}
          filteredEvents={filteredEvents}
        />
        <HeadlineStat
          title="Districts Covered"
          value={`${new Set(filteredEvents.filter(e => e.district && e.district !== "Out of State").map(e => e.district)).size}/33`}
          icon={MapPin}
          allEvents={events}
          filteredEvents={filteredEvents}
        />
      </div>

      {/* Stats by event type */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          By Event Type
        </h3>
        <CategoryBreakdown events={filteredEvents} />
      </div>

      {/* District coverage + event photos */}
      <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
        <div className="lg:col-span-5">
          <DistrictCoverageRing events={filteredEvents} />
        </div>
        <div className="lg:col-span-4">
          <PhotoCarousel events={events} />
        </div>
      </div>
    </div>
  )
}
