// Provides UI controls (date range, district, event type) for filtering dashboard data
// Displays active filters as removable pills and allows clearing all filters

"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"

import type { EventData } from "@/lib/types"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FilterPill } from "@/components/dashboard/filter-pill"
import { cn } from "@/lib/utils"

import { CalendarIcon, MapPinIcon, TagIcon, X } from "lucide-react"

interface DashboardFiltersProps {
  allEvents: EventData[];                    // Complete list of events (used to derive available districts & types)
  date: DateRange | undefined;               // Current selected date range filter
  district: string | undefined;              // Currently selected district filter
  eventType: string | undefined;             // Currently selected event type filter
  onDateChange: (date: DateRange | undefined) => void; // Callback for changing date range
  onDistrictChange: (district: string | undefined) => void; // Callback for changing district
  onEventTypeChange: (type: string | undefined) => void;    // Callback for changing event type
  onClearAll: () => void;                    // Callback to reset all filters
}

/**
 * A filter panel for the dashboard that allows filtering events by:
 * - Date range
 * - District
 * - Event type
 * Automatically computes unique districts and event types from allEvents
 */
export function DashboardFilters({
  allEvents,
  date,
  district,
  eventType,
  onDateChange,
  onDistrictChange,
  onEventTypeChange,
  onClearAll
}: DashboardFiltersProps) {
  // Derive unique district options from events
  const districts = React.useMemo(() => {
    const uniqueDistricts = new Set(allEvents.map(event => event.district))
    return Array.from(uniqueDistricts).sort()
  }, [allEvents])

  // Derive unique event type options from events
  const eventTypes = React.useMemo(() => {
    const uniqueTypes = new Set(allEvents.map(event => event.type))
    return Array.from(uniqueTypes).sort()
  }, [allEvents])

  // Check if any filter is currently active
  const hasActiveFilters = !!date || !!district || !!eventType

  return (
    <div className="space-y-6 p-5 bg-gradient-to-br from-background/90 via-background/80 to-amber-500/10 border border-amber-500/30 rounded-xl shadow-lg">
      {/* Header row with title + "Clear all" button */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            onClick={onClearAll} 
            className="text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>
      
      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-accent/30 rounded-lg border border-white/20 dark:border-white/10 backdrop-blur-sm shadow-sm">
          {/* Date range pill */}
          {date?.from && (
            <FilterPill 
              variant="accent"
              onRemove={() => onDateChange(undefined)}
            >
              {date.to 
                ? `${format(date.from, "MMM dd")} - ${format(date.to, "MMM dd")}`
                : `From ${format(date.from, "MMM dd")}`}
            </FilterPill>
          )}
          {/* District pill */}
          {district && (
            <FilterPill 
              variant="success"
              onRemove={() => onDistrictChange(undefined)}
            >
              {district}
            </FilterPill>
          )}
          {/* Event type pill */}
          {eventType && (
            <FilterPill 
              variant="info"
              onRemove={() => onEventTypeChange(undefined)}
            >
              {eventType}
            </FilterPill>
          )}
        </div>
      )}
      
      {/* Filters Section */}
      <div className="space-y-6">
        {/* Date range filter */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-semibold text-foreground">
            <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
            Date Range
          </label>
          <DateRangePicker date={date} onDateChange={onDateChange} />
        </div>
        
        <Separator className="my-2 bg-white/20 dark:bg-white/15" />
        
        {/* District filter */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-semibold text-foreground">
            <MapPinIcon className="w-4 h-4 mr-2 text-primary" />
            District
          </label>
          <Select
            onValueChange={value => onDistrictChange(value === 'all' ? undefined : value)}
            value={district || 'all'}
          >
            <SelectTrigger
              className={cn(
                "w-full py-5 border border-white/20 bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm hover:border-white/30 focus:ring-2 focus:ring-primary/50",
                district && district !== 'all' && "border-primary/50 bg-primary/5 dark:bg-primary/10"
              )}
            >
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-lg border border-white/10 dark:border-white/5 bg-gradient-to-br from-background/80 to-background/60">
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        <Separator className="my-2 bg-white/20 dark:bg-white/15" />
        
        {/* Event type filter */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-semibold text-foreground">
            <TagIcon className="w-4 h-4 mr-2 text-primary" />
            Event Type
          </label>
          <Select
            onValueChange={value => onEventTypeChange(value === 'all' ? undefined : value)}
            value={eventType || 'all'}
          >
            <SelectTrigger
              className={cn(
                "w-full py-5 border border-white/20 bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm hover:border-white/30 focus:ring-2 focus:ring-primary/50",
                eventType && eventType !== 'all' && "border-primary/50 bg-primary/5 dark:bg-primary/10"
              )}
            >
              <SelectValue placeholder="Select Event Type" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-lg border border-white/10 dark:border-white/5 bg-gradient-to-br from-background/80 to-background/60">
              <SelectItem value="all">All Event Types</SelectItem>
              {eventTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}