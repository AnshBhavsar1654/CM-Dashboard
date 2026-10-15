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
import { TOTAL_DISTRICTS, isGujaratDistrict } from "@/lib/districts"

export function OverviewWrapper({ events }: { events: EventData[] }) {
  const [dateRange, setDateRange] = React.useState<DateRange>()

  const filteredEvents = React.useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return events
    const fromMs = dateRange?.from ? startOfMonth(dateRange.from).getTime() : -Infinity
    const toMs = dateRange?.to ? endOfMonth(dateRange.to).getTime() : Infinity
    return events.filter(e => e.eventDateMs >= fromMs && e.eventDateMs <= toMs)
  }, [events, dateRange])

  const totalDistance = React.useMemo(
    () => filteredEvents.reduce((sum, e) => sum + e.distanceTravelled, 0),
    [filteredEvents]
  )

  const districtsCovered = React.useMemo(
    () => new Set(filteredEvents.map(e => e.district).filter(isGujaratDistrict)).size,
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
        {[0, 1, 2].map((i) => {
          const stats = [
            {
              title: "Total Events",
              value: filteredEvents.length,
              icon: Layers,
              showTrend: true,
            },
            {
              title: "Distance Traveled",
              value: `${Math.round(totalDistance).toLocaleString("en-IN")} km`,
              subtitle: "total",
              icon: Route,
            },
            {
              title: "Districts Covered",
              value: `${districtsCovered}/${TOTAL_DISTRICTS}`,
              icon: MapPin,
            },
          ]
          const s = stats[i]
          return (
            <div key={s.title} className="animate-stagger-in" style={{ animationDelay: `${i * 80}ms` }}>
              <HeadlineStat
                title={s.title}
                value={s.value}
                subtitle={"subtitle" in s ? s.subtitle : undefined}
                icon={s.icon}
                allEvents={events}
                filteredEvents={filteredEvents}
                showTrend={"showTrend" in s && s.showTrend}
              />
            </div>
          )
        })}
      </div>

      {/* Stats by event type */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          By Event Type
        </h3>
        <div className="animate-stagger-in" style={{ animationDelay: "280ms" }}>
          <CategoryBreakdown events={filteredEvents} />
        </div>
      </div>

      {/* District coverage + event photos */}
      <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
        <div className="lg:col-span-5 animate-stagger-in" style={{ animationDelay: "360ms" }}>
          <DistrictCoverageRing events={filteredEvents} />
        </div>
        <div className="lg:col-span-4 animate-stagger-in" style={{ animationDelay: "400ms" }}>
          <PhotoCarousel events={events} />
        </div>
      </div>
    </div>
  )
}
