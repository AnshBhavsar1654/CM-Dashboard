"use client"

import * as React from "react"
import { MonthlyEventChart } from "@/components/trends/monthly-event-chart"
import { DateFilterPopover } from "@/components/common/date-filter-popover"
import type { DateRange } from "react-day-picker"
import type { EventData } from "@/lib/types"

export function TrendsWrapper({ events }: { events: EventData[] }) {
  const [dateRange, setDateRange] = React.useState<DateRange>()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Monthly Trends</h2>
          <p className="text-sm text-muted-foreground">
            Event frequency trends over time with trend line.
          </p>
        </div>
        <DateFilterPopover dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      <MonthlyEventChart data={events} dateRange={dateRange} />
    </div>
  )
}
