
"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { format, subMonths, startOfMonth } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { EventData } from "@/lib/types"

const RechartsBar = dynamic(async () => {
  const m = await import("recharts");
  return {
    default: ({ 
      data, 
    }: { 
      data: any[]; 
    }) => (
      <m.ResponsiveContainer width="100%" height={450}>
        <m.ComposedChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 75 }}
        >
          <m.CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <m.XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={50}
            interval={0}
            tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
          />
          <m.YAxis
            tick={{ fill: 'hsl(var(--foreground))' }}
            allowDecimals={false}
            domain={[0, 'dataMax + 10']}
          />
          {(() => {
            const TooltipContent = ({ active, payload, label }: any) => {
              if (active && payload && payload.length) {
                const row = payload[0]?.payload || {};
                return (
                  <div className="p-3 bg-gradient-to-br from-background/95 to-background/90 border border-border/50 rounded-lg shadow-xl min-w-[180px] backdrop-blur-sm">
                    <p className="font-bold text-foreground text-lg mb-2">{label}</p>
                    <p className="text-sm font-semibold text-primary">
                      Total Events: <span className="font-bold">{row.value}</span>
                    </p>
                    {row.types && Object.keys(row.types).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Breakdown by type:</p>
                        <ul className="text-xs list-disc list-inside">
                          {Object.entries(row.types).map(([t, c]: any) => (
                            <li key={String(t)} className="text-foreground"><span className="font-medium">{String(t)}:</span> {String(c)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            };
            return <m.Tooltip content={<TooltipContent />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />;
          })()}
          <m.Bar 
            dataKey="value" 
            name="Events" 
            fill="hsl(var(--primary))" 
            barSize={40}
            radius={[4, 4, 0, 0]}
            animationDuration={1200}
            style={{ 
              cursor: 'default'
            }}
          >
            <m.LabelList dataKey="value" position="top" offset={10} style={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
          </m.Bar>
          <m.Line
            type="monotone"
            dataKey="lineValue"
            stroke="hsl(var(--accent))"
            strokeWidth={3}
            strokeDasharray="0"
            dot={{ 
              stroke: 'hsl(var(--accent))', 
              strokeWidth: 3, 
              r: 5, 
              fill: 'hsl(var(--background))',
              strokeDasharray: "0"
            }}
            activeDot={{ 
              r: 8, 
              fill: 'hsl(var(--accent))', 
              stroke: 'hsl(var(--background))', 
              strokeWidth: 3 
            }}
            isAnimationActive={true}
            animationDuration={1500}
            connectNulls={true}
          />
        </m.ComposedChart>
      </m.ResponsiveContainer>
    )
  }
}, { ssr: false })

export function MonthlyEventChart({ data }: { data: EventData[] }) {
  const chartRef = React.useRef<HTMLDivElement>(null);

  const chartData = React.useMemo(() => {
    const monthData: { [key: string]: { total: number; types: Record<string, number> } } = {};
    const monthLabels: string[] = [];
    const today = new Date();

    // Generate labels for the last 12 months in reverse chronological order
    for (let i = 0; i < 12; i++) {
      const d = subMonths(today, i);
      const monthKey = format(d, "MMM yyyy");
      monthLabels.push(monthKey);
      monthData[monthKey] = { total: 0, types: {} };
    }

    const last12MonthsStart = startOfMonth(subMonths(today, 11));

    data.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate >= last12MonthsStart) {
        const monthKey = format(eventDate, "MMM yyyy");
        if (monthKey in monthData) {
          monthData[monthKey].total++;
          const eventType = event.type || 'Other';
          monthData[monthKey].types[eventType] = (monthData[monthKey].types[eventType] || 0) + 1;
        }
      }
    });
    
    // Map the counts to the chart data format, in correct chronological order
    return monthLabels.reverse().map(label => ({
      name: label,
      value: monthData[label].total,
      lineValue: monthData[label].total, // Duplicate for line chart
      types: monthData[label].types
    }));
  }, [data]);

  const cardTitle = 'Monthly Event Trend';
  const cardDescription = 'Number of events held per month over the last 12 months with trend line, based on current filters.';

  return (
    <Card className="bg-gradient-to-br from-card/50 via-card/30 to-secondary/5 border border-secondary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{cardTitle}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent ref={chartRef} className="border border-border/30 rounded-lg bg-gradient-to-br from-background/20 to-background/10 backdrop-blur-sm p-2">
        <RechartsBar 
          data={chartData} 
        />
      </CardContent>
    </Card>
  );
}
