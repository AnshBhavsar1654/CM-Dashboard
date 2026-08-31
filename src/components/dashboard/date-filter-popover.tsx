"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { subMonths, startOfMonth, format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SlidersHorizontal, X } from "lucide-react"

const QUICK_RANGES = [
  { label: "All time", value: undefined },
  { label: "3 months", value: 3 },
  { label: "6 months", value: 6 },
  { label: "1 year", value: 12 },
  { label: "2 years", value: 24 },
] as const;

interface DateFilterPopoverProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  quickRanges?: { label: string; value: number | undefined }[]
}

export function DateFilterPopover({
  dateRange,
  onDateRangeChange,
  quickRanges = QUICK_RANGES as any,
}: DateFilterPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const hasFilter = dateRange?.from || dateRange?.to

  const quickSelect = (months: number | undefined) => {
    if (months === undefined) {
      onDateRangeChange(undefined)
    } else {
      const to = new Date()
      const from = startOfMonth(subMonths(to, months - 1))
      onDateRangeChange({ from, to })
    }
  }

  const activeLabel = hasFilter && dateRange?.from
    ? `${format(dateRange.from, "MMM d")}${dateRange.to ? ` – ${format(dateRange.to, "MMM d")}` : ""}`
    : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {hasFilter && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
              1
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Date range</span>
            {hasFilter && (
              <button
                onClick={() => { onDateRangeChange(undefined) }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {quickRanges.map((range) => (
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
                className="justify-center text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) => onDateRangeChange(range as DateRange | undefined)}
            numberOfMonths={2}
          />
        </div>
        {hasFilter && (
          <div className="flex items-center justify-between border-t px-3 py-2">
            <span className="text-xs text-muted-foreground truncate">{activeLabel}</span>
            <Button variant="ghost" size="sm" onClick={() => onDateRangeChange(undefined)} className="h-7 gap-1 text-xs">
              <X className="h-3 w-3" />
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
