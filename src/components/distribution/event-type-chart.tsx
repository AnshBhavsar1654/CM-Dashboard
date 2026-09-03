"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import type { EventData } from "@/lib/types"
import {
  CHART_COLORS,
  eventTypeToCategory,
} from "./chart-colors"

function DonutSkeleton() {
  const segments = [0, 1, 2, 3, 4];
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative w-[300px] h-[300px]">
        {segments.map((i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              inset: 0,
              background: `hsl(var(--surface-elevation-${(i % 2) + 1}) / ${0.15 + i * 0.05})`,
              mask: `conic-gradient(from ${i * 72}deg, black 0deg, black 50deg, transparent 50deg, transparent 360deg)`,
              WebkitMask: `conic-gradient(from ${i * 72}deg, black 0deg, black 50deg, transparent 50deg, transparent 360deg)`,
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full animate-pulse"
          style={{ background: "hsl(var(--surface-elevation-1) / 0.25)" }}
        />
      </div>
    </div>
  );
}

function DonutEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="relative w-24 h-24">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "3px dashed hsl(var(--surface-elevation-2) / 0.5)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full"
          style={{
            border: "2px dashed hsl(var(--surface-elevation-2) / 0.35)",
          }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          No events to display
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Try adjusting your filters
        </p>
      </div>
    </div>
  );
}

const RechartsPie = dynamic(async () => {
  const m = await import("recharts")
  return {
    default: ({
      data,
      colors,
      fillOpacities,
      onSegmentClick,
      onSliceHover,
      showLegend = true,
      animationDuration = 1000,
    }: {
      data: any[];
      colors: string[];
      fillOpacities?: number[];
      onSegmentClick?: (data: any) => void;
      onSliceHover?: (data: any | null) => void;
      showLegend?: boolean;
      animationDuration?: number;
    }) => (
      <m.ResponsiveContainer width="100%" height="100%">
        <m.PieChart>
          {(() => {
            const TooltipContent = ({ active, payload }: any) => {
              if (active && payload && payload.length) {
                return (
                  <div className="p-3 bg-background border rounded-lg shadow-md">
                    <p className="font-semibold text-foreground">
                      {payload[0].name}
                    </p>
                    <p className="text-sm text-primary font-medium">
                      Events: {payload[0].value}
                    </p>
                    {onSegmentClick && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Click to drill down
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            };
            return <m.Tooltip content={<TooltipContent />} />;
          })()}
          {showLegend && (
            <m.Legend
              layout="horizontal"
              verticalAlign="top"
              align="center"
              wrapperStyle={{ fontSize: "12px", paddingBottom: "20px" }}
            />
          )}
          <m.Pie
            data={data}
            cx="50%"
            cy="55%"
            labelLine={false}
            outerRadius="75%"
            innerRadius="42%"
            dataKey="value"
            nameKey="name"
            label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
            onClick={onSegmentClick}
            onMouseEnter={(_: any, index: number) =>
              onSliceHover?.(data[index] ?? null)
            }
            onMouseLeave={() => onSliceHover?.(null)}
            animationDuration={animationDuration}
            animationBegin={0}
          >
            {data.map((entry: any, index: number) => (
              <m.Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                fillOpacity={fillOpacities?.[index] ?? 1}
                stroke="hsl(var(--background))"
                strokeWidth={2}
                style={{ cursor: onSegmentClick ? "pointer" : "default" }}
              />
            ))}
          </m.Pie>
        </m.PieChart>
      </m.ResponsiveContainer>
    ),
  };
}, { ssr: false });

export function EventTypeChart({
  data,
  loading,
}: {
  data: EventData[];
  loading?: boolean;
}) {
  const [drillDownData, setDrillDownData] = React.useState<{
    type: string;
    events: EventData[];
  } | null>(null);
  const [showLegend, setShowLegend] = React.useState(true);
  const [hoveredSlice, setHoveredSlice] = React.useState<{
    name: string;
    value: number;
  } | null>(null);

  const chartData = React.useMemo(() => {
    if (drillDownData) {
      const districtCounts = drillDownData.events.reduce(
        (acc, event) => {
          acc[event.district] = (acc[event.district] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      return Object.entries(districtCounts).map(([name, value]) => ({
        name,
        value,
      }));
    }
    const typeCounts = data.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [data, drillDownData]);

  const colors = React.useMemo(() => {
    if (drillDownData) {
      const category = eventTypeToCategory(drillDownData.type);
      const baseColor = CHART_COLORS[category];
      return chartData.map(() => baseColor);
    }
    return chartData.map((entry) => {
      const category = eventTypeToCategory(entry.name);
      return CHART_COLORS[category];
    });
  }, [chartData, drillDownData]);

  const fillOpacities = React.useMemo(() => {
    if (!drillDownData) return undefined;
    return chartData.map((_, i) => {
      if (chartData.length === 1) return 1;
      return 0.5 + (i / (chartData.length - 1)) * 0.5;
    });
  }, [chartData, drillDownData]);

  const totalEvents = React.useMemo(
    () => chartData.reduce((sum, d) => sum + d.value, 0),
    [chartData]
  );

  const handleSegmentClick = React.useCallback(
    (segmentData: any) => {
      if (!drillDownData) {
        const eventsOfType = data.filter(
          (event) => event.type === segmentData.name
        );
        setDrillDownData({ type: segmentData.name, events: eventsOfType });
        setHoveredSlice(null);
      }
    },
    [data, drillDownData]
  );

  const handleBackClick = React.useCallback(() => {
    setDrillDownData(null);
    setHoveredSlice(null);
  }, []);

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Event Types Distribution</CardTitle>
              <CardDescription>Loading event data…</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div style={{ width: "100%", height: 420 }}>
            <DonutSkeleton />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="h-full flex flex-col justify-center items-center min-h-[458px]">
        <CardHeader>
          <CardTitle>Event Types Distribution</CardTitle>
          <CardDescription>
            A breakdown of events by their type for the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <DonutEmpty />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {drillDownData
                ? `${drillDownData.type} by District`
                : "Event Types Distribution"}
            </CardTitle>
            <CardDescription>
              {drillDownData
                ? `District breakdown for ${drillDownData.type} events`
                : "Breakdown of events by type. Click segments to drill down."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {drillDownData && (
              <Button variant="outline" size="sm" onClick={handleBackClick}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLegend(!showLegend)}
            >
              {showLegend ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="relative" style={{ width: "100%", height: 420 }}>
          <RechartsPie
            data={chartData}
            colors={colors}
            fillOpacities={fillOpacities}
            onSegmentClick={drillDownData ? undefined : handleSegmentClick}
            onSliceHover={setHoveredSlice}
            showLegend={showLegend}
            animationDuration={800}
          />
          <div
            className="absolute inset-0 flex items-center justify-center pt-8 pointer-events-none select-none"
          >
            <div className="text-center">
              {hoveredSlice ? (
                <>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {hoveredSlice.value}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-[120px] truncate">
                    {hoveredSlice.name}
                  </p>
                  <p className="text-xs text-muted-foreground/70 tabular-nums">
                    {((hoveredSlice.value / totalEvents) * 100).toFixed(1)}%
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-foreground tabular-nums">
                    {totalEvents}
                  </p>
                  <p className="text-xs text-muted-foreground">total events</p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
