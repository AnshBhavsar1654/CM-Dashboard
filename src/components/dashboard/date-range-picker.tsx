
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
import { Badge } from "../ui/badge"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(date);
  
  const setQuickRange = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    const range = { from, to };
    onDateChange(range);
    setOpen(false);
  };

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
  };

  const handleApply = () => {
    onDateChange(selectedRange);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Reset the selected range when opening the popover
    if (isOpen) {
      setSelectedRange(date);
    }
    // Apply the selected range when closing the popover
    if (!isOpen) {
      onDateChange(selectedRange);
    }
  };

  return (
    <div className={cn("grid gap-3", className)}>
      <div className="flex items-center gap-3">
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-medium border border-white/20 bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm hover:border-white/30 hover:from-background/60 hover:to-background/40 dark:hover:from-background/50 dark:hover:to-background/30 transition-all duration-200 shadow-sm hover:shadow-md py-6",
                date && "border-primary/50 bg-primary/5 dark:bg-primary/10",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span className="text-muted-foreground">Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 border border-white/10 dark:border-white/5 shadow-2xl bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-lg" 
            align="start"
            sideOffset={8}
            collisionPadding={16}
          >
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={selectedRange}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
            <div className="flex justify-end gap-2 p-3 border-t border-white/10 dark:border-white/5">
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleApply}
                className="bg-primary hover:bg-primary/90"
              >
                OK
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        {(date?.from || date?.to) && (
          <Button 
            variant="outline" 
            onClick={() => onDateChange(undefined)} 
            className="border border-white/20 bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm hover:border-white/30 hover:from-background/60 hover:to-background/40 dark:hover:from-background/50 dark:hover:to-background/30 py-6"
          >
            Clear
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Badge 
          variant="outline" 
          className="cursor-pointer border border-primary/70 bg-primary/80 backdrop-blur-sm hover:border-primary hover:bg-primary transition-all duration-200 text-xs px-4 py-2 hover:shadow-sm font-medium text-white hover:scale-105 hover:shadow-primary/30 hover:ring-1 hover:ring-primary/50"
          onClick={() => setQuickRange(7)}
        >
          Last 7 days
        </Badge>
        <Badge 
          variant="outline" 
          className="cursor-pointer border border-primary/70 bg-primary/80 backdrop-blur-sm hover:border-primary hover:bg-primary transition-all duration-200 text-xs px-4 py-2 hover:shadow-sm font-medium text-white hover:scale-105 hover:shadow-primary/30 hover:ring-1 hover:ring-primary/50"
          onClick={() => setQuickRange(30)}
        >
          Last 30 days
        </Badge>
        <Badge 
          variant="outline" 
          className="cursor-pointer border border-primary/70 bg-primary/80 backdrop-blur-sm hover:border-primary hover:bg-primary transition-all duration-200 text-xs px-4 py-2 hover:shadow-sm font-medium text-white hover:scale-105 hover:shadow-primary/30 hover:ring-1 hover:ring-primary/50"
          onClick={() => setQuickRange(90)}
        >
          Last 90 days
        </Badge>
        <Badge 
          variant="outline" 
          className="cursor-pointer border border-primary/70 bg-primary/80 backdrop-blur-sm hover:border-primary hover:bg-primary transition-all duration-200 text-xs px-4 py-2 hover:shadow-sm font-medium text-white hover:scale-105 hover:shadow-primary/30 hover:ring-1 hover:ring-primary/50"
          onClick={() => setQuickRange(120)}
        >
          Last 120 days
        </Badge>
      </div>
    </div>
  )
}
