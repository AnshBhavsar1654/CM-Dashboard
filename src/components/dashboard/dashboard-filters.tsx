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

import { CalendarIcon, MapPinIcon, TagIcon, X } from "lucide-react"

interface DashboardFiltersProps {
  allEvents: EventData[]
  date: DateRange | undefined
  district: string | undefined
  eventType: string | undefined
  onDateChange: (date: DateRange | undefined) => void
  onDistrictChange: (district: string | undefined) => void
  onEventTypeChange: (type: string | undefined) => void
  onClearAll: () => void
}

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
  const districts = React.useMemo(() => {
    const uniqueDistricts = new Set(allEvents.map(event => event.district))
    return Array.from(uniqueDistricts).sort()
  }, [allEvents])

  const eventTypes = React.useMemo(() => {
    const uniqueTypes = new Set(allEvents.map(event => event.type))
    return Array.from(uniqueTypes).sort()
  }, [allEvents])

  const hasActiveFilters = !!date || !!district || !!eventType

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs text-muted-foreground hover:text-destructive h-8">
            <X className="w-3.5 h-3.5 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          {date?.from && (
            <FilterPill variant="default" onRemove={() => onDateChange(undefined)}>
              {date.to
                ? `${format(date.from, "MMM dd")} - ${format(date.to, "MMM dd")}`
                : `From ${format(date.from, "MMM dd")}`}
            </FilterPill>
          )}
          {district && (
            <FilterPill variant="secondary" onRemove={() => onDistrictChange(undefined)}>
              {district}
            </FilterPill>
          )}
          {eventType && (
            <FilterPill variant="outline" onRemove={() => onEventTypeChange(undefined)}>
              {eventType}
            </FilterPill>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
            Date Range
          </label>
          <DateRangePicker date={date} onDateChange={onDateChange} />
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPinIcon className="w-3.5 h-3.5 text-muted-foreground" />
            District
          </label>
          <Select
            onValueChange={value => onDistrictChange(value === 'all' ? undefined : value)}
            value={district || 'all'}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
            Event Type
          </label>
          <Select
            onValueChange={value => onEventTypeChange(value === 'all' ? undefined : value)}
            value={eventType || 'all'}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Event Types</SelectItem>
              {eventTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
