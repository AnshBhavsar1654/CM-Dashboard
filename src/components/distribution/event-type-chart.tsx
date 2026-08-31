"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import type { EventData } from "@/lib/types"

const RechartsPie = dynamic(async () => {
  const m = await import("recharts")
  return {
    default: ({
      data,
      colors,
      onSegmentClick,
      showLegend = true,
      animationDuration = 1000
    }: {
      data: any[];
      colors: string[];
      onSegmentClick?: (data: any) => void;
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
                    <p className="font-semibold text-foreground">{payload[0].name}</p>
                    <p className="text-sm text-primary font-medium">Events: {payload[0].value}</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to drill down</p>
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
              wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }}
            />
          )}
          <m.Pie
            data={data}
            cx="50%" cy="55%"
            labelLine={false}
            outerRadius="60%"
            innerRadius="30%"
            dataKey="value"
            nameKey="name"
            label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
            onClick={onSegmentClick}
            animationDuration={animationDuration}
            animationBegin={0}
          >
            {data.map((entry: any, index: number) => (
              <m.Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="hsl(var(--background))"
                strokeWidth={2}
                style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
              />
            ))}
          </m.Pie>
        </m.PieChart>
      </m.ResponsiveContainer>
    ),
  }
}, { ssr: false })

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))"
];

export function EventTypeChart({ data }: { data: EventData[] }) {
  const [drillDownData, setDrillDownData] = React.useState<{ type: string; events: EventData[] } | null>(null);
  const [showLegend, setShowLegend] = React.useState(true);

  const chartData = React.useMemo(() => {
    if (drillDownData) {
      const districtCounts = drillDownData.events.reduce((acc, event) => {
        acc[event.district] = (acc[event.district] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return Object.entries(districtCounts).map(([name, value]) => ({ name, value }));
    }
    const typeCounts = data.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [data, drillDownData]);

  const handleSegmentClick = React.useCallback((segmentData: any) => {
    if (!drillDownData) {
      const eventsOfType = data.filter(event => event.type === segmentData.name);
      setDrillDownData({ type: segmentData.name, events: eventsOfType });
    }
  }, [data, drillDownData]);

  const handleBackClick = React.useCallback(() => {
    setDrillDownData(null);
  }, []);

  if (chartData.length === 0) {
    return (
      <Card className="h-full flex flex-col justify-center items-center min-h-[458px]">
        <CardHeader>
          <CardTitle>Event Types Distribution</CardTitle>
          <CardDescription>A breakdown of events by their type for the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data to display for the selected filters.</p>
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
              {drillDownData ? `${drillDownData.type} by District` : 'Event Types Distribution'}
            </CardTitle>
            <CardDescription>
              {drillDownData
                ? `District breakdown for ${drillDownData.type} events`
                : 'Breakdown of events by type. Click segments to drill down.'
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {drillDownData && (
              <Button variant="outline" size="sm" onClick={handleBackClick}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowLegend(!showLegend)}>
              {showLegend ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div style={{ width: '100%', height: 650 }}>
          <RechartsPie
            data={chartData}
            colors={COLORS}
            onSegmentClick={drillDownData ? undefined : handleSegmentClick}
            showLegend={showLegend}
            animationDuration={800}
          />
        </div>
      </CardContent>
    </Card>
  );
}
