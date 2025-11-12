// The main container for the dashboard page

"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import { addDays, subDays } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { EventData } from "@/lib/types";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { MapView } from "@/components/dashboard/map-view";
import { EventsTable } from "@/components/dashboard/events-table";
import { Skeleton } from "@/components/ui/skeleton";
import { EventTypeChart } from "@/components/dashboard/event-type-chart";
import { DistrictEventChart } from "@/components/dashboard/district-event-chart";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { MonthlyEventChart } from "@/components/dashboard/monthly-event-chart";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Filter } from "lucide-react";
import { ImageCarousel } from "@/components/dashboard/image-carousel";

/**
 Handles:
 * Displaying charts, stats, and tables
 * Loading state with skeletons
 * Filtering by date, district, and event type
 * Syncing filters with the URL (deep-linking/sharing filters)
 * Interactive UI (map, carousel, filters button, etc.)
 */
export function Dashboard({ initialEvents }: { initialEvents: EventData[] }) {
  // All events and filtered subset
  const [allEvents, setAllEvents] = React.useState<EventData[]>(initialEvents);
  const [filteredEvents, setFilteredEvents] = React.useState<EventData[]>(initialEvents);

  // Loading state: true if no initial events
  const [isLoading, setIsLoading] = React.useState(!initialEvents || initialEvents.length === 0);

  // Filter states
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const [district, setDistrict] = React.useState<string | undefined>(undefined);
  const [eventType, setEventType] = React.useState<string | undefined>(undefined);

  // URL sync helpers
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset states whenever new initialEvents come in
  React.useEffect(() => {
    setAllEvents(initialEvents);
    setFilteredEvents(initialEvents);
    setIsLoading(!initialEvents || initialEvents.length === 0);
  }, [initialEvents]);

  /**
   * On mount → initialize filters from URL query parameters
   * - Reads `district`, `type`, `from`, `to`
   * - Applies them to state
   */
  React.useEffect(() => {
    const d = searchParams.get("district") || undefined;
    const t = searchParams.get("type") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;

    if (d) setDistrict(d);
    if (t) setEventType(t);
    if (from || to) {
      try {
        const fromDate = from ? new Date(from) : undefined;
        const toDate = to ? new Date(to) : undefined;
        setDate({ from: fromDate, to: toDate });
      } catch {
        // Invalid date values ignored
      }
    } else {
      // Default to last 2 years if no URL params provided
      const toDate = new Date();
      const fromDate = subDays(toDate, 730);
      setDate({ from: fromDate, to: toDate });
    }
  }, []);

  /**
   * Whenever filters change → push updated filters into the URL
   * Example: /dashboard?district=Ahmedabad&type=Health&from=2024-08-01&to=2024-08-31
   */
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (district) params.set("district", district);
    if (eventType) params.set("type", eventType);
    if (date?.from) params.set("from", date.from.toISOString().slice(0, 10));
    if (date?.to) params.set("to", date.to.toISOString().slice(0, 10));

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [district, eventType, date?.from, date?.to, router, pathname]);

  /**
   * Apply filters to events whenever filters or events change
   */
  React.useEffect(() => {
    if (isLoading) return;

    const filtered = allEvents.filter((event) => {
      // Date filter
      if (date?.from || date?.to) {
        const fromMs = date?.from ? date.from.getTime() : undefined;
        const toMsExclusive = date?.to ? addDays(date.to, 1).getTime() : undefined;

        if (fromMs !== undefined && event.eventDateMs < fromMs) return false;
        if (toMsExclusive !== undefined && event.eventDateMs >= toMsExclusive) return false;
      }

      // District filter
      if (district && event.district !== district) return false;

      // Event type filter
      if (eventType && event.type !== eventType) return false;

      return true;
    });

    setFilteredEvents(filtered);
  }, [date, district, eventType, allEvents, isLoading]);

  /**
   * LOADING STATE → Show skeletons while waiting for events
   */
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-transparent text-foreground">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {/* Skeleton placeholders for dashboard layout */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Skeleton className="lg:col-span-4 h-24" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 md:gap-8">
            <Skeleton className="h-24 lg:col-span-2" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <div className="hidden lg:block"></div>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:gap-8">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-1">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:gap-8">
            <Skeleton className="h-[600px] w-full" />
          </div>
        </main>
      </div>
    );
  }

  /**
   * MAIN DASHBOARD UI → Render charts, stats, filters, etc.
   */
  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent text-foreground">
      {/* Header */}
      <DashboardHeader />

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Stats + Carousel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-6">
          <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col">
            <StatsGrid data={filteredEvents} />
          </div>
          <div className="lg:col-span-2 order-1 lg:order-2 flex flex-col">
            <ImageCarousel events={allEvents} />
          </div>
        </div>

        {/* Map + Event Types */}
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
          <MapView data={filteredEvents} selectedDistrict={district} />
          <EventTypeChart data={filteredEvents} />
        </div>

        {/* District breakdown */}
        <div className="grid grid-cols-1 gap-4 md:gap-8">
          <DistrictEventChart
            data={allEvents}
            onDistrictSelect={setDistrict}
            selectedDistrict={district}
          />
        </div>

        {/* Monthly Trends */}
        <div className="grid grid-cols-1 gap-4 md:gap-8">
          <MonthlyEventChart data={filteredEvents} />
        </div>

        {/* Event Table */}
        <div className="grid grid-cols-1 gap-4 md:gap-8">
          <EventsTable data={filteredEvents} />
        </div>
      </main>

      {/* Floating Filters Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <Popover>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button className="rounded-full h-14 shadow-xl bg-gradient-to-br from-primary/90 to-primary/70 backdrop-blur-sm border border-white/20 hover:from-primary/80 hover:to-primary/60 text-primary-foreground transition-all duration-300 hover:shadow-2xl px-5 hover:scale-105">
                    <div className="flex items-center">
                      <Filter className="h-5 w-5 mr-2" />
                      <span className="text-base font-medium">Filters</span>
                    </div>
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>

              {/* Popover → contains the filter controls */}
              <PopoverContent
                className="w-96 bg-gradient-to-br from-background/80 via-background/70 to-amber-500/5 backdrop-blur-lg border border-amber-500/20 shadow-2xl"
                align="end"
                side="top"
                sideOffset={12}
              >
                <DashboardFilters
                  allEvents={allEvents}
                  date={date}
                  district={district}
                  eventType={eventType}
                  onDateChange={setDate}
                  onDistrictChange={setDistrict}
                  onEventTypeChange={setEventType}
                  onClearAll={() => {
                    setDate(undefined);
                    setDistrict(undefined);
                    setEventType(undefined);
                  }}
                />
              </PopoverContent>
            </Popover>
            <TooltipContent side="left">
              <p>Open filters</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}