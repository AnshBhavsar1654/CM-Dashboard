"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
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

export function Dashboard({ initialEvents }: { initialEvents: EventData[] }) {
  const [allEvents, setAllEvents] = React.useState<EventData[]>(initialEvents);
  const [filteredEvents, setFilteredEvents] = React.useState<EventData[]>(initialEvents);
  const [isLoading, setIsLoading] = React.useState(!initialEvents || initialEvents.length === 0);

  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const [district, setDistrict] = React.useState<string | undefined>(undefined);
  const [eventType, setEventType] = React.useState<string | undefined>(undefined);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    setAllEvents(initialEvents);
    setFilteredEvents(initialEvents);
    setIsLoading(!initialEvents || initialEvents.length === 0);
  }, [initialEvents]);

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
      } catch {}
    }
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (district) params.set("district", district);
    if (eventType) params.set("type", eventType);
    if (date?.from) params.set("from", date.from.toISOString().slice(0, 10));
    if (date?.to) params.set("to", date.to.toISOString().slice(0, 10));

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [district, eventType, date?.from, date?.to, router, pathname]);

  React.useEffect(() => {
    if (isLoading) return;

    const filtered = allEvents.filter((event) => {
      if (date?.from || date?.to) {
        const fromMs = date?.from ? date.from.getTime() : undefined;
        const toMsExclusive = date?.to ? addDays(date.to, 1).getTime() : undefined;

        if (fromMs !== undefined && event.eventDateMs < fromMs) return false;
        if (toMsExclusive !== undefined && event.eventDateMs >= toMsExclusive) return false;
      }

      if (district && event.district !== district) return false;
      if (eventType && event.type !== eventType) return false;

      return true;
    });

    setFilteredEvents(filtered);
  }, [date, district, eventType, allEvents, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Skeleton className="lg:col-span-3 h-32" />
            <Skeleton className="lg:col-span-2 h-32" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[500px]" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <StatsGrid data={filteredEvents} />
          </div>
          <div className="lg:col-span-2 order-1 lg:order-2">
            <ImageCarousel events={allEvents} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MapView data={filteredEvents} selectedDistrict={district} />
          <EventTypeChart data={filteredEvents} />
        </div>

        <DistrictEventChart
          data={allEvents}
          onDistrictSelect={setDistrict}
          selectedDistrict={district}
        />

        <MonthlyEventChart data={filteredEvents} />

        <EventsTable data={filteredEvents} />
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <Popover>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                    <Filter className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <PopoverContent
                className="w-96"
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
