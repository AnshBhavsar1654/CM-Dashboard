"use client";

import { Route, MapPin, Building2, Handshake, Megaphone, Layers, LucideIcon, CalendarDays, Ellipsis, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { EventData } from "@/lib/types";

export function TotalDistanceCard({ value, events }: { value: number; events?: EventData[] }) {
  const calculateDistanceMetrics = () => {
    if (!events || events.length === 0) {
      return { avgDistancePerMonth: value, trend: 'stable' as const, currentMonthAvg: value };
    }
    const dates = events.map(event => new Date(event.eventDateMs));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1;
    const overallAvg = monthsDiff <= 1 ? value : Math.ceil(value / monthsDiff);
    const currentMonth = new Date();
    const currentMonthEvents = events.filter(event => {
      const eventDate = new Date(event.eventDateMs);
      return eventDate.getMonth() === currentMonth.getMonth() && eventDate.getFullYear() === currentMonth.getFullYear();
    });
    let currentMonthDistance = 0;
    if (currentMonthEvents.length === 0) {
      const latestMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      const latestMonthEvents = events.filter(event => {
        const eventDate = new Date(event.eventDateMs);
        return eventDate.getMonth() === latestMonth.getMonth() && eventDate.getFullYear() === latestMonth.getFullYear();
      });
      currentMonthDistance = Math.ceil(latestMonthEvents.reduce((sum, event) => sum + event.distanceTravelled, 0));
    } else {
      currentMonthDistance = Math.ceil(currentMonthEvents.reduce((sum, event) => sum + event.distanceTravelled, 0));
    }
    const trend = currentMonthDistance > overallAvg ? 'up' : currentMonthDistance < overallAvg ? 'down' : 'stable';
    return { avgDistancePerMonth: overallAvg, trend, currentMonthAvg: currentMonthDistance };
  };

  const { avgDistancePerMonth, trend, currentMonthAvg } = calculateDistanceMetrics();

  return (
    <Card className="mx-auto w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Total Distance</CardTitle>
        <div className="flex items-center gap-1.5">
          {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
          {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
          <Route className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex-grow flex flex-col">
        <div className="text-3xl font-bold tracking-tight">{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })} km</div>
        <p className="text-xs text-muted-foreground mt-1">across all events</p>
        <div className="mt-auto pt-3 border-t border-border/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Monthly avg</span>
            <span className="text-xs font-medium">{Math.ceil(avgDistancePerMonth)} km/mo</span>
          </div>
          {trend !== 'stable' && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">This month</span>
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {Math.ceil(currentMonthAvg)} km ({trend === 'up' ? 'above' : 'below'} avg)
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DistrictsCoveredCard({ value }: { value: number }) {
  const coveragePercent = Math.round((value / 33) * 100);
  const remaining = 33 - value;
  const indicatorClass = coveragePercent < 40 ? "bg-red-500" : coveragePercent < 80 ? "bg-amber-500" : "bg-green-500";

  return (
    <Card className="mx-auto w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Districts Covered</CardTitle>
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-muted-foreground" />
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex-grow flex flex-col">
        <div className="text-3xl font-bold tracking-tight">{value}<span className="text-lg font-normal text-muted-foreground">/33</span></div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">districts visited</p>
          {remaining > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {remaining} remaining
            </span>
          )}
        </div>
        <div className="mt-auto pt-3 border-t border-border/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Coverage</span>
            <span className="text-xs font-medium">{coveragePercent}%</span>
          </div>
          <Progress value={coveragePercent} className="h-1.5" indicatorClassName={indicatorClass} />
        </div>
      </CardContent>
    </Card>
  );
}

export function CulturalReligiousEventsCard({ value, events }: { value: number; events?: EventData[] }) {
  const calculateTrend = () => {
    if (!events || events.length === 0) return { avgPerMonth: 0, trend: 'neutral' as const };
    const filteredEvents = events.filter(event => event.type.toLowerCase() === "cultural & religious event");
    if (filteredEvents.length === 0) return { avgPerMonth: 0, trend: 'neutral' as const };
    const dates = filteredEvents.map(event => new Date(event.eventDateMs));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1;
    const avgPerMonth = monthsDiff > 0 ? Math.round(filteredEvents.length / monthsDiff) : 0;
    const currentMonth = new Date();
    const currentMonthEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.eventDateMs);
      return eventDate.getMonth() === currentMonth.getMonth() && eventDate.getFullYear() === currentMonth.getFullYear();
    }).length;
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (avgPerMonth > 0) {
      if (currentMonthEvents > avgPerMonth) trend = 'up';
      else if (currentMonthEvents < avgPerMonth) trend = 'down';
    }
    return { avgPerMonth, trend };
  };

  const { avgPerMonth, trend } = calculateTrend();

  return (
    <Card className="mx-auto w-full h-full flex flex-col min-h-[120px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Cultural & Religious</CardTitle>
        <div className="flex items-center gap-1">
          {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
          {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
          {trend === 'neutral' && <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />}
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 flex-grow flex flex-col justify-center">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-0.5">events conducted</p>
        {avgPerMonth > 0 && (
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/50">
            <span className="text-xs text-muted-foreground">Avg/month</span>
            <span className="text-xs font-medium">{avgPerMonth}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TotalEventsCard({ value, events }: { value: number; events?: EventData[] }) {
  const calculateEventMetrics = () => {
    if (!events || events.length === 0) {
      return { trend: 'stable' as const, eventsPerMonth: value, daysSinceLastEvent: 0, projectedMonthly: value };
    }
    const sortedEvents = [...events].sort((a, b) => a.eventDateMs - b.eventDateMs);
    const now = new Date();
    const firstEventDate = new Date(sortedEvents[0].eventDateMs);
    const lastEventDate = new Date(sortedEvents[sortedEvents.length - 1].eventDateMs);
    const daysSinceLastEvent = Math.floor((now.getTime() - lastEventDate.getTime()) / (1000 * 60 * 60 * 24));
    const monthsDiff = Math.max(1, (lastEventDate.getFullYear() - firstEventDate.getFullYear()) * 12 + (lastEventDate.getMonth() - firstEventDate.getMonth()) + 1);
    const eventsPerMonth = Math.round(value / monthsDiff);
    const currentMonth = new Date();
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const currentMonthEvents = events.filter(event => {
      const eventDate = new Date(event.eventDateMs);
      return eventDate.getMonth() === currentMonth.getMonth() && eventDate.getFullYear() === currentMonth.getFullYear();
    }).length;
    const previousMonthEvents = events.filter(event => {
      const eventDate = new Date(event.eventDateMs);
      return eventDate.getMonth() === previousMonth.getMonth() && eventDate.getFullYear() === previousMonth.getFullYear();
    }).length;
    const thisMonthCount = currentMonthEvents > 0 ? currentMonthEvents : events.filter(event => {
      const eventDate = new Date(event.eventDateMs);
      return eventDate.getMonth() === lastEventDate.getMonth() && eventDate.getFullYear() === lastEventDate.getFullYear();
    }).length;
    const lastMonthCount = Math.max(previousMonthEvents, 1);
    const trend = thisMonthCount > lastMonthCount ? 'up' : thisMonthCount < lastMonthCount ? 'down' : 'stable';
    const daysIntoMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedMonthly = currentMonthEvents > 0 ? Math.round((currentMonthEvents / daysIntoMonth) * daysInMonth) : Math.round(eventsPerMonth);
    return { trend, eventsPerMonth, daysSinceLastEvent, projectedMonthly };
  };

  const metrics = calculateEventMetrics();

  return (
    <Card className="mx-auto w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
        <div className="flex items-center gap-1.5">
          {metrics.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
          {metrics.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
          {metrics.daysSinceLastEvent <= 7 && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
          <Layers className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex-grow flex flex-col">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">total events</p>
        <div className="mt-auto pt-3 border-t border-border/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Monthly avg</span>
            <span className="text-xs font-medium">{metrics.eventsPerMonth}/mo</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Projected</span>
            <span className="text-xs font-medium">{metrics.projectedMonthly} events</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  Icon: LucideIcon;
  events?: EventData[];
  eventTypeFilter?: string | string[];
}

export function StatCard({ title, value, Icon, events = [], eventTypeFilter }: StatCardProps) {
  const calculateTrend = () => {
    if (!events || events.length === 0) return { avgPerMonth: 0, trend: 'neutral' as const };
    let filteredEvents = events;
    if (eventTypeFilter) {
      if (typeof eventTypeFilter === 'string') {
        filteredEvents = events.filter(event => event.type.toLowerCase() === eventTypeFilter.toLowerCase());
      } else if (Array.isArray(eventTypeFilter)) {
        filteredEvents = events.filter(event => eventTypeFilter.some(filter => event.type.toLowerCase() === filter.toLowerCase()));
      }
    }
    if (filteredEvents.length === 0) return { avgPerMonth: 0, trend: 'neutral' as const };
    const dates = filteredEvents.map(event => new Date(event.eventDateMs));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1;
    const avgPerMonth = monthsDiff > 0 ? Math.round(filteredEvents.length / monthsDiff) : 0;
    const currentMonth = new Date();
    const currentMonthEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.eventDateMs);
      return eventDate.getMonth() === currentMonth.getMonth() && eventDate.getFullYear() === currentMonth.getFullYear();
    }).length;
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (avgPerMonth > 0) {
      if (currentMonthEvents > avgPerMonth) trend = 'up';
      else if (currentMonthEvents < avgPerMonth) trend = 'down';
    }
    return { avgPerMonth, trend };
  };

  const { avgPerMonth, trend } = calculateTrend();

  return (
    <Card className="mx-auto w-full h-full flex flex-col min-h-[120px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
        <CardTitle className="text-sm font-medium text-muted-foreground leading-tight">{title}</CardTitle>
        <div className="flex items-center gap-1">
          {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
          {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
          {trend === 'neutral' && <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />}
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 flex-grow flex flex-col justify-center">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-0.5">events conducted</p>
        {avgPerMonth > 0 && (
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/50">
            <span className="text-xs text-muted-foreground">Avg/month</span>
            <span className="text-xs font-medium">{avgPerMonth}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const eventTypeCardsConfig = [
  { title: "Govt. Events", key: "governmentEvents", Icon: Building2 },
  { title: "Public Events", key: "publicEvents", Icon: Handshake },
  { title: "Social Events", key: "socialEvents", Icon: CalendarDays },
  { title: "Political Events", key: "politicalEvents", Icon: Megaphone },
  { title: "Other Events", key: "otherEvents", Icon: Ellipsis },
] as const;
