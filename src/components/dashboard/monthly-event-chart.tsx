"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { format, subMonths, startOfMonth } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { EventData } from "@/lib/types"

const RechartsBar = dynamic(async () => {
  const m = await import("recharts");
  return {
    default: ({ data }: { data: any[] }) => (
      <m.ResponsiveContainer width="100%" height={450}>
        <m.ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 75 }}>
          <m.CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <m.XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={50}
            interval={0}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          />
          <m.YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} domain={[0, 'dataMax + 10']} />
          {(() => {
            const TooltipContent = ({ active, payload, label }: any) => {
              if (active && payload && payload.length) {
                const row = payload[0]?.payload || {};
                return (
                  <div className="p-3 bg-background border rounded-lg shadow-md min-w-[180px]">
                    <p className="font-semibold text-foreground mb-1">{label}</p>
                    <p className="text-sm text-primary font-medium">Total: {row.value}</p>
                    {row.types && Object.keys(row.types).length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t">
                        <p className="text-xs text-muted-foreground mb-0.5">Breakdown:</p>
                        {Object.entries(row.types).map(([t, c]: any) => (
                          <p key={String(t)} className="text-xs">{String(t)}: {String(c)}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            };
            return <m.Tooltip content={<TooltipContent />} cursor={{ fill: 'hsl(var(--primary) / 0.05)' }} />;
          })()}
          <m.Bar dataKey="value" name="Events" fill="hsl(var(--primary))" barSize={40} radius={[4, 4, 0, 0]} animationDuration={1200} style={{ cursor: 'default' }}>
            <m.LabelList dataKey="value" position="top" offset={10} style={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} />
          </m.Bar>
          <m.Line
            type="monotone"
            dataKey="lineValue"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={{ stroke: 'hsl(var(--destructive))', strokeWidth: 2, r: 4, fill: 'hsl(var(--background))' }}
            activeDot={{ r: 7, fill: 'hsl(var(--destructive))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
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
  const chartData = React.useMemo(() => {
    const monthData: { [key: string]: { total: number; types: Record<string, number> } } = {};
    const monthLabels: string[] = [];
    const today = new Date();

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

    return monthLabels.reverse().map(label => ({
      name: label,
      value: monthData[label].total,
      lineValue: monthData[label].total,
      types: monthData[label].types
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Event Trend</CardTitle>
        <CardDescription>Events per month over the last 12 months with trend line.</CardDescription>
      </CardHeader>
      <CardContent>
        <RechartsBar data={chartData} />
      </CardContent>
    </Card>
  );
}
