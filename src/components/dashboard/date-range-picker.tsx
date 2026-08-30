"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(date)

  const setQuickRange = (days: number) => {
    const to = new Date()
    const from = subDays(to, days)
    onDateChange({ from, to })
    setOpen(false)
  }

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)
  }

  const handleApply = () => {
    onDateChange(selectedRange)
    setOpen(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) setSelectedRange(date)
    if (!isOpen) onDateChange(selectedRange)
  }

  return (
    <div className={cn("grid gap-3", className)}>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-10",
                date && "text-foreground",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" sideOffset={8} collisionPadding={16}>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={selectedRange}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
            <div className="flex justify-end gap-2 p-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleApply}>OK</Button>
            </div>
          </PopoverContent>
        </Popover>

        {(date?.from || date?.to) && (
          <Button variant="outline" onClick={() => onDateChange(undefined)} className="h-10">
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { label: "Last 7 days", days: 7 },
          { label: "Last 30 days", days: 30 },
          { label: "Last 90 days", days: 90 },
          { label: "Last 120 days", days: 120 },
          { label: "Last 2 years", days: 730 },
        ].map(({ label, days }) => (
          <Button
            key={days}
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setQuickRange(days)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
