// Stats cards shown at the top of the dashboard. Each card computes simple
"use client";

import { Users, Route, MapPin, Building2, Handshake, Megaphone, Layers, LucideIcon, CalendarDays, Ellipsis, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { EventData } from "@/lib/types";


// TotalDistanceCard displays total distance travelled and a monthly average with a trend indicator
export function TotalDistanceCard({ value, events }: { value: number; events?: EventData[] }) {
  // Calculate monthly average and trend based on actual date range
  const calculateDistanceMetrics = () => {
    if (!events || events.length === 0) {
      return { 
        avgDistancePerMonth: value, 
        trend: 'stable' as const,
        currentMonthAvg: value,
        overallAvg: value
      };
    }
    
    // Get the date range from events (min/max by eventDateMs)
    const dates = events.map(event => new Date(event.eventDateMs));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Calculate the number of months between min and max date
    const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + 
                      (maxDate.getMonth() - minDate.getMonth()) + 1;
    
    // Overall average across all months (rounded up)
    const overallAvg = monthsDiff <= 1 ? value : Math.ceil(value / monthsDiff);
    
    // Current month calculation (or the latest month with events if current has none)
    const currentMonth = new Date();
    const currentMonthEvents = events.filter(event => {
      const eventDate = new Date(event.eventDateMs);
      return eventDate.getMonth() === currentMonth.getMonth() && 
             eventDate.getFullYear() === currentMonth.getFullYear();
    });
    
    // If no events in current month, use the latest month with events
    let currentMonthDistance = 0;
    if (currentMonthEvents.length === 0) {
      // Find the latest month with events
      const latestMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      const latestMonthEvents = events.filter(event => {
        const eventDate = new Date(event.eventDateMs);
        return eventDate.getMonth() === latestMonth.getMonth() && 
               eventDate.getFullYear() === latestMonth.getFullYear();
      });
      currentMonthDistance = latestMonthEvents.reduce((sum, event) => sum + event.distanceTravelled, 0);
    } else {
      currentMonthDistance = currentMonthEvents.reduce((sum, event) => sum + event.distanceTravelled, 0);
    }
    
    // Round up current month distance to whole number
    currentMonthDistance = Math.ceil(currentMonthDistance);
    
    // Trend vs overall average for a quick up/down/stable marker
    const trend = currentMonthDistance > overallAvg ? 'up' : 
                  currentMonthDistance < overallAvg ? 'down' : 'stable';
    
    return {
      avgDistancePerMonth: overallAvg,
      trend,
      currentMonthAvg: currentMonthDistance
    };
  };

  const { avgDistancePerMonth, trend, currentMonthAvg } = calculateDistanceMetrics();
  
  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-amber-500/10 border border-amber-500/30 shadow-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300 hover:scale-105 group dark:bg-card dark:border-amber-500/50 dark:hover:shadow-amber-500/30 dark:hover:border-amber-500/60 mx-auto w-full max-w-[350px] h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3 flex-shrink-0">
        <CardTitle className="text-base font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Total Distance Travelled</CardTitle>
        <div className="flex items-center gap-1">
          {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
          <Route className="h-8 w-8 text-amber-600 group-hover:scale-110 transition-transform duration-200 dark:text-amber-400" />
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 flex-grow flex flex-col">
        <div className="text-4xl font-bold dark:text-amber-400 leading-none">{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })} km</div>
        <p className="text-sm text-muted-foreground mt-1">across all events</p>
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Monthly average</span>
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{Math.ceil(avgDistancePerMonth)} km/month</span>
          </div>
          {trend !== 'stable' && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">This month</span>
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {Math.ceil(currentMonthAvg)} km ({trend === 'up' ? 'above' : 'below'} avg)
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


// Shows how many of 33 districts have been covered, a remaining count, and a progress bar.
export function DistrictsCoveredCard({ value }: { value: number }) {
  const coveragePercent = Math.round((value / 33) * 100);
  const remaining = 33 - value;
  // Color thresholds for coverage: <40 red, 40-79 yellow, >=80 green
  const indicatorClass = coveragePercent < 40
    ? "bg-red-500"
    : coveragePercent < 80
      ? "bg-yellow-500"
      : "bg-green-500";
  
  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-amber-500/10 border border-amber-500/30 shadow-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300 hover:scale-105 group dark:bg-card dark:border-amber-500/50 dark:hover:shadow-amber-500/30 dark:hover:border-amber-500/60 mx-auto w-full max-w-[350px] h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3 flex-shrink-0">
        <CardTitle className="text-base font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Districts Covered</CardTitle>
        <div className="flex items-center gap-1">
          <Target className="h-4 w-4 text-blue-500" />
          <MapPin className="h-8 w-8 text-amber-600 group-hover:scale-110 transition-transform duration-200 dark:text-amber-400" />
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 flex-grow flex flex-col">
        <div className="text-4xl font-bold dark:text-amber-400 leading-none">{value}</div>
        <div className="flex items-center justify-between mt-1 mb-2">
          <p className="text-sm text-muted-foreground">of 33 Districts</p>
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
            {remaining} remaining
          </span>
        </div>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Coverage</span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{coveragePercent}%</span>
          </div>
          <Progress value={coveragePercent} className="h-1.5" indicatorClassName={indicatorClass} />
        </div>
      </CardContent>
    </Card>
  );
}
 
// Displays count of cultural & religious events with avg/month and a simple trend.
export function CulturalReligiousEventsCard({ value, events }: { value: number; events?: EventData[] }) {
  // Calculate average events per month and trend
  const calculateTrend = () => {
    if (!events || events.length === 0) return { avgPerMonth: 0, trend: 'neutral' as const };
    
    // Filter events by type
    const filteredEvents = events.filter(event => 
      event.type.toLowerCase() === "cultural & religious event"
    );
      
    if (filteredEvents.length === 0) return { avgPerMonth: 0, trend: 'neutral' as const };
    
    // Get date range
    const dates = filteredEvents.map(event => new Date(event.eventDateMs));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Calculate months between first and last event
    const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + 
                      (maxDate.getMonth() - minDate.getMonth()) + 1;
                      
    // Calculate average per month and round to nearest whole number
    const avgPerMonth = monthsDiff > 0 ? Math.round(filteredEvents.length / monthsDiff) : 0;
    
    // Calculate current month events
    const currentMonth = new Date();
    const currentMonthEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.eventDateMs);
      return eventDate.getMonth() === currentMonth.getMonth() && 
             eventDate.getFullYear() === currentMonth.getFullYear();
    }).length;
    
    // Determine trend
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (avgPerMonth > 0) {
      if (currentMonthEvents > avgPerMonth) {
        trend = 'up';
      } else if (currentMonthEvents < avgPerMonth) {
        trend = 'down';
      }
    }
    
    return { avgPerMonth, trend };
  };
  
  const { avgPerMonth, trend } = calculateTrend();
  
  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-blue-500/10 border border-blue-500/30 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 group dark:bg-card dark:border-blue-500/50 dark:hover:shadow-blue-500/30 dark:hover:border-blue-500/60 mx-auto w-full h-full flex flex-col min-h-[120px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-2 flex-shrink-0">
        <CardTitle className="text-sm font-medium bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">Cultural & Religious</CardTitle>
        <div className="flex items-center gap-1">
          {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
          {trend === 'neutral' && <div className="w-2 h-2 rounded-full bg-gray-300" />}
          <CalendarDays className="h-7 w-7 text-blue-600 group-hover:scale-110 transition-transform duration-200 dark:text-blue-400" />
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-2 pt-0 flex-grow flex flex-col justify-center">
        <div className="text-3xl font-bold dark:text-blue-400 leading-none">{value}</div>
        <p className="text-xs text-muted-foreground mt-0.5">events conducted</p>
        {avgPerMonth > 0 && (
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-border">
            <span className="text-xs text-muted-foreground">Avg/month</span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {avgPerMonth}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



// Displays total events with monthly average, days since last event, and a simple projection.
export function TotalEventsCard({ value, events }: { value: number; events?: EventData[] }) {
  // Enhanced analytics for Total Events card
  const calculateEventMetrics = () => {
    if (!events || events.length === 0) {
      return {
        trend: 'stable' as const,
        trendPercent: 0,
        eventsPerMonth: value,
        dominantEventType: 'Unknown',
        daysSinceLastEvent: 0,
        projectedMonthly: value
      };
    }

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => a.eventDateMs - b.eventDateMs);
    const now = new Date();
    
    // Calculate time-based metrics
    const firstEventDate = new Date(sortedEvents[0].eventDateMs);
    const lastEventDate = new Date(sortedEvents[sortedEvents.length - 1].eventDateMs);
    const daysSinceLastEvent = Math.floor((now.getTime() - lastEventDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Monthly calculations
    const monthsDiff = Math.max(1, (lastEventDate.getFullYear() - firstEventDate.getFullYear()) * 12 + 
                               (lastEventDate.getMonth() - firstEventDate.getMonth()) + 1);
    const eventsPerMonth = Math.round(value / monthsDiff);
    
    // Current month vs previous month trend
    const currentMonth = new Date();
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    
    const currentMonthEvents = events.filter(event => {
      const eventDate = new Date(event.eventDateMs);
      return eventDate.getMonth() === currentMonth.getMonth() && 
             eventDate.getFullYear() === currentMonth.getFullYear();
    }).length;
    
    const previousMonthEvents = events.filter(event => {
      const eventDate = new Date(event.eventDateMs);
      return eventDate.getMonth() === previousMonth.getMonth() && 
             eventDate.getFullYear() === previousMonth.getFullYear();
    }).length;
    
    // If no current month events, use latest month data
    const thisMonthCount = currentMonthEvents > 0 ? currentMonthEvents : 
                          events.filter(event => {
                            const eventDate = new Date(event.eventDateMs);
                            return eventDate.getMonth() === lastEventDate.getMonth() && 
                                   eventDate.getFullYear() === lastEventDate.getFullYear();
                          }).length;
    
    const lastMonthCount = Math.max(previousMonthEvents, 1); // Avoid division by zero
    const trend = thisMonthCount > lastMonthCount ? 'up' : 
                  thisMonthCount < lastMonthCount ? 'down' : 'stable';
    const trendPercent = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
    
    // - If events have already happened this month (currentMonthEvents > 0):
    //    Calculate the average pace so far: currentMonthEvents / daysIntoMonth
    //    Extrapolate that pace to the whole month: * daysInMonth
    //    Round the result to nearest whole number
    //    Predicts how many events will occur by month-end if the pace continues
    // - If no events yet this month, fallback to the historical average (eventsPerMonth)
    const daysIntoMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedMonthly = currentMonthEvents > 0 ? 
      Math.round((currentMonthEvents / daysIntoMonth) * daysInMonth) : Math.round(eventsPerMonth);
    
    return {
      trend,
      trendPercent: Math.abs(trendPercent),
      eventsPerMonth,
      daysSinceLastEvent,
      projectedMonthly,
      thisMonthCount,
      lastMonthCount
    };
  };

  const metrics = calculateEventMetrics();
  
  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-amber-500/10 border border-amber-500/30 shadow-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300 hover:scale-105 group dark:bg-card dark:border-amber-500/50 dark:hover:shadow-amber-500/30 dark:hover:border-amber-500/60 mx-auto w-full max-w-[350px] h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3 flex-shrink-0">
        <CardTitle className="text-base font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Total Events</CardTitle>
        <div className="flex items-center gap-1">
          {metrics.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
          {metrics.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
          {metrics.daysSinceLastEvent <= 7 && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          <Layers className="h-8 w-8 text-amber-600 group-hover:scale-110 transition-transform duration-200 dark:text-amber-400" />
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 flex-grow flex flex-col">
        <div className="text-4xl font-bold dark:text-amber-400 leading-none">{value}</div>
        <p className="text-sm text-muted-foreground mt-1">total events</p>
        <div className="mt-auto space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Monthly avg</span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{metrics.eventsPerMonth}/month</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Projected this month</span>
            <span className={`text-xs font-medium ${
              metrics.projectedMonthly >= 10 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
            }`}>
              {metrics.projectedMonthly} events
            </span>
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
  eventTypeFilter?: string | string[]; // Accept either a single string or array of strings
}

// Generic small KPI card used for event type breakdowns (Govt/Public/Social/etc.).
// Optionally filters the provided events by `eventTypeFilter` to compute avg/month and trend.
export function StatCard({ title, value, Icon, events = [], eventTypeFilter }: StatCardProps) {
  const subtitles = {
    "Govt. Events": "events conducted",
    "Public Events": "events conducted",
    "Social Events": "events conducted",
    "Political Events": "events conducted",
    "Other Events": "events conducted"
  };

  // Calculate average events per month and trend
  const calculateTrend = () => {
    if (!events || events.length === 0) return { avgPerMonth: 0, trend: 'neutral' as const };
    
    // Filter events by type if filter is provided
    let filteredEvents = events;
    if (eventTypeFilter) {
      if (typeof eventTypeFilter === 'string') {
        // Single filter
        filteredEvents = events.filter(event => event.type.toLowerCase() === eventTypeFilter.toLowerCase());
      } else if (Array.isArray(eventTypeFilter)) {
        // Multiple filters
        filteredEvents = events.filter(event => 
          eventTypeFilter.some(filter => event.type.toLowerCase() === filter.toLowerCase())
        );
      }
    }
      
    if (filteredEvents.length === 0) return { avgPerMonth: 0, trend: 'neutral' as const };
    
    // Get date range
    const dates = filteredEvents.map(event => new Date(event.eventDateMs));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Calculate months between first and last event
    const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + 
                      (maxDate.getMonth() - minDate.getMonth()) + 1;
                      
    // Calculate average per month and round to nearest whole number
    const avgPerMonth = monthsDiff > 0 ? Math.round(filteredEvents.length / monthsDiff) : 0;
    
    // Calculate current month events
    const currentMonth = new Date();
    const currentMonthEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.eventDateMs);
      return eventDate.getMonth() === currentMonth.getMonth() && 
             eventDate.getFullYear() === currentMonth.getFullYear();
    }).length;
    
    // Determine trend
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (avgPerMonth > 0) {
      if (currentMonthEvents > avgPerMonth) {
        trend = 'up';
      } else if (currentMonthEvents < avgPerMonth) {
        trend = 'down';
      }
    }
    
    return { avgPerMonth, trend };
  };
  
  const { avgPerMonth, trend } = calculateTrend();

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-blue-500/10 border border-blue-500/30 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 group dark:bg-card dark:border-blue-500/50 dark:hover:shadow-blue-500/30 dark:hover:border-blue-500/60 mx-auto w-full h-full flex flex-col min-h-[120px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-2 flex-shrink-0">
        <CardTitle className="text-sm font-medium bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">{title}</CardTitle>
        <div className="flex items-center gap-1">
          {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
          {trend === 'neutral' && <div className="w-2 h-2 rounded-full bg-gray-300" />}
          <Icon className="h-7 w-7 text-blue-600 group-hover:scale-110 transition-transform duration-200 dark:text-blue-400" />
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-2 pt-0 flex-grow flex flex-col justify-center">
        <div className="text-3xl font-bold dark:text-blue-400 leading-none">{value}</div>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitles[title as keyof typeof subtitles] || "events conducted"}</p>
        {avgPerMonth > 0 && (
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-border">
            <span className="text-xs text-muted-foreground">Avg/month</span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {avgPerMonth}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const eventTypeCardsConfig = [
    { title: "Govt. Events", key: "governmentEvents", Icon: Building2 },
    { title: "Public Events", key: "publicEvents", Icon: Users },
    { title: "Social Events", key: "socialEvents", Icon: Handshake },
    { title: "Political Events", key: "politicalEvents", Icon: Megaphone },
    { title: "Other Events", key: "otherEvents", Icon: Ellipsis },
] as const;