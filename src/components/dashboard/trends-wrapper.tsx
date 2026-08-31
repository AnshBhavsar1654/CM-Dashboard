"use client"

import * as React from "react"
import { MonthlyEventChart, type DateRange } from "@/components/dashboard/monthly-event-chart"
import type { EventData } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format, subMonths, startOfMonth } from "date-fns"

const QUICK_RANGES = [
  { label: "All time", value: undefined },
  { label: "Last 3 months", value: 3 },
  { label: "Last 6 months", value: 6 },
  { label: "Last 1 year", value: 12 },
  { label: "Last 2 years", value: 24 },
] as const;

export function TrendsWrapper({ events }: { events: EventData[] }) {
  const [dateRange, setDateRange] = React.useState<DateRange>(undefined);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const quickSelect = (months: number | undefined) => {
    if (months === undefined) {
      setDateRange(undefined);
    } else {
      const to = new Date();
      const from = startOfMonth(subMonths(to, months - 1));
      setDateRange({ from, to });
    }
  };

  const hasFilter = dateRange?.from || dateRange?.to;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Monthly Trends</h2>
          <p className="text-sm text-muted-foreground">
            Event frequency trends over time with trend line.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {QUICK_RANGES.map((range) => (
            <Button
              key={range.label}
              variant={
                (range.value === undefined && !hasFilter) ||
                (range.value !== undefined && dateRange?.from &&
                  dateRange.from.getTime() === startOfMonth(subMonths(new Date(), range.value - 1)).getTime())
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => quickSelect(range.value)}
            >
              {range.label}
            </Button>
          ))}

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from
                  ? `${format(dateRange.from, "MMM d, yyyy")}${dateRange.to ? ` – ${format(dateRange.to, "MMM d, yyyy")}` : ""}`
                  : "Custom range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange as any}
                onSelect={(range) => setDateRange(range as DateRange)}
                numberOfMonths={2}
              />
              <div className="flex justify-end border-t p-2">
                <Button size="sm" onClick={() => setCalendarOpen(false)}>
                  Done
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {hasFilter && (
            <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)} className="gap-1">
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <MonthlyEventChart data={events} dateRange={dateRange} />
    </div>
  );
}
