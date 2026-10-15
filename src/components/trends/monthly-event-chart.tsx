"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { EventData } from "@/lib/types"
import type { DateRange } from "react-day-picker"

interface ChartPoint {
  name: string
  value: number
  rollingAvg: number | null
  momChange: string | null
  types: Record<string, number>
  index: number
}

function computeRollingAverage(data: { value: number }[], window = 3): (number | null)[] {
  return data.map((_, i) => {
    if (i < window - 1) return null
    let sum = 0
    for (let j = i - window + 1; j <= i; j++) sum += data[j].value
    return Math.round((sum / window) * 10) / 10
  })
}

const RechartsArea = dynamic(async () => {
  const m = await import("recharts");

  const CustomTooltip = ({ active, payload, _label }: any) => {
    if (!active || !payload?.length) return null
    const row = payload[0]?.payload as ChartPoint
    if (!row) return null

    return (
      <div className="px-4 py-3 bg-popover border border-border rounded-xl shadow-lg min-w-[200px] backdrop-blur-sm">
        <p className="font-headline text-sm font-semibold text-foreground mb-2">{row.name}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs text-muted-foreground">Events</span>
            <span className="text-sm font-semibold text-primary">{row.value}</span>
          </div>
          {row.momChange && (
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs text-muted-foreground">vs prev month</span>
              <span className={`text-xs font-medium ${row.momChange.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : row.momChange === "—" ? "text-muted-foreground" : "text-red-500 dark:text-red-400"}`}>
                {row.momChange}
              </span>
            </div>
          )}
          {row.rollingAvg !== null && (
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs text-muted-foreground">3-mo avg</span>
              <span className="text-xs font-medium text-accent-foreground/70">{row.rollingAvg}</span>
            </div>
          )}
        </div>
        {row.types && Object.keys(row.types).length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            {Object.entries(row.types).slice(0, 5).map(([t, c]: any) => (
              <div key={String(t)} className="flex items-center justify-between text-xs py-0.5">
                <span className="text-muted-foreground truncate max-w-[120px]">{String(t)}</span>
                <span className="text-foreground font-medium">{String(c)}</span>
              </div>
            ))}
            {Object.keys(row.types).length > 5 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">+{Object.keys(row.types).length - 5} more</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const MinMaxAnnotation = ({ x, y, value, label, isMin }: any) => {
    if (x == null || y == null) return null
    const color = isMin ? "hsl(346, 80%, 46%)" : "hsl(174, 72%, 30%)"
    const bgColor = isMin ? "hsla(346, 80%, 46%, 0.10)" : "hsla(174, 72%, 30%, 0.10)"
    const textY = isMin ? y + 22 : y - 14
    return (
      <g>
        <circle cx={x} cy={y} r={5} fill={color} stroke="hsl(var(--background))" strokeWidth={2} />
        <rect x={x - 36} y={isMin ? y + 8 : y - 26} width={72} height={18} rx={4} fill={bgColor} />
        <text x={x} y={textY} textAnchor="middle" fill={color} fontSize={10} fontWeight={600} fontFamily="Inter, sans-serif">
          {label} {value}
        </text>
      </g>
    );
  };

  return {
    default: AreaChartInner
  }

  function AreaChartInner({ data, rollingAvgKey }: { data: ChartPoint[]; rollingAvgKey: string }) {
    const [gradientId] = React.useState(() => `area-gradient-${Math.random().toString(36).slice(2, 9)}`)
    const [rollGradientId] = React.useState(() => `roll-gradient-${Math.random().toString(36).slice(2, 9)}`)

    const minPoint = data.reduce((min, d) => d.value < min.value ? d : min, data[0])
    const maxPoint = data.reduce((max, d) => d.value > max.value ? d : max, data[0])

    return (
      <m.ResponsiveContainer width="100%" height={450}>
        <m.AreaChart data={data} margin={{ top: 30, right: 30, left: 20, bottom: 75 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
              <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity={0.06} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={rollGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent-foreground))" stopOpacity={0.12} />
              <stop offset="100%" stopColor="hsl(var(--accent-foreground))" stopOpacity={0} />
            </linearGradient>
          </defs>

          <m.CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.6} vertical={false} />

          <m.XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={55}
            interval={data.length > 24 ? "preserveStartEnd" : 0}
            minTickGap={8}
            tick={{ fontSize: 11, fontFamily: "Inter, sans-serif", fill: "hsl(var(--muted-foreground))", opacity: 0.85 }}
          />
          <m.YAxis
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            domain={[0, "dataMax + 10"]}
            tick={{ fontSize: 11, fontFamily: "Inter, sans-serif", fill: "hsl(var(--muted-foreground))", opacity: 0.85 }}
          />

          <m.Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: "hsl(var(--muted-foreground))",
              strokeWidth: 1,
              strokeDasharray: "4 4",
              strokeOpacity: 0.4,
            }}
            wrapperStyle={{ outline: "none" }}
          />

          <m.Area
            type="monotone"
            dataKey="value"
            name="Events"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 6,
              fill: "hsl(var(--primary))",
              stroke: "hsl(var(--background))",
              strokeWidth: 3,
            }}
            isAnimationActive={true}
            animationDuration={1400}
            animationEasing="ease-out"
          />

          <m.Area
            type="monotone"
            dataKey={rollingAvgKey}
            name="Rolling Avg"
            stroke="hsl(var(--accent-foreground) / 0.5)"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            fill={`url(#${rollGradientId})`}
            dot={false}
            activeDot={{
              r: 4,
              fill: "hsl(var(--accent-foreground) / 0.5)",
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
            connectNulls={true}
            isAnimationActive={true}
            animationDuration={1600}
            animationEasing="ease-out"
          />

          {data.length > 1 && (
            <>
              <m.ReferenceDot
                x={minPoint.name}
                y={minPoint.value}
                r={0}
                label={(props: any) => (
                  <MinMaxAnnotation {...props} value={minPoint.value} label="Low" isMin={true} />
                )}
              />
              <m.ReferenceDot
                x={maxPoint.name}
                y={maxPoint.value}
                r={0}
                label={(props: any) => (
                  <MinMaxAnnotation {...props} value={maxPoint.value} label="High" isMin={false} />
                )}
              />
            </>
          )}
        </m.AreaChart>
      </m.ResponsiveContainer>
    );
  }
}, { ssr: false })

export function MonthlyEventChart({
  data,
  dateRange,
  description,
}: {
  data: EventData[];
  dateRange?: DateRange;
  description?: string;
}) {
  const chartData = React.useMemo(() => {
    const fromMs = dateRange?.from ? startOfMonth(dateRange.from).getTime() : -Infinity
    const toMs = dateRange?.to ? endOfMonth(dateRange.to).getTime() : Infinity
    const eventsInRange = data.filter(e => e.eventDateMs >= fromMs && e.eventDateMs <= toMs)
    if (eventsInRange.length === 0) return []

    // Bucket by numeric month index (year * 12 + month) so sorting never depends on string date parsing
    const buckets = new Map<number, { total: number; types: Record<string, number> }>()
    let minIdx = Infinity
    let maxIdx = -Infinity
    for (const event of eventsInRange) {
      const d = new Date(event.eventDateMs)
      const idx = d.getFullYear() * 12 + d.getMonth()
      minIdx = Math.min(minIdx, idx)
      maxIdx = Math.max(maxIdx, idx)
      const bucket = buckets.get(idx) ?? { total: 0, types: {} }
      bucket.total++
      const eventType = event.type || 'Other'
      bucket.types[eventType] = (bucket.types[eventType] || 0) + 1
      buckets.set(idx, bucket)
    }

    // Include empty months so gaps show up as zeros instead of being silently skipped
    const baseData = Array.from({ length: maxIdx - minIdx + 1 }, (_, i) => {
      const idx = minIdx + i
      const bucket = buckets.get(idx)
      return {
        name: format(new Date(Math.floor(idx / 12), idx % 12, 1), "MMM yyyy"),
        value: bucket?.total ?? 0,
        types: bucket?.types ?? {},
        index: i,
      }
    })

    const rollingAvgs = computeRollingAverage(baseData, 3);

    return baseData.map((d, i) => {
      const prev = i > 0 ? baseData[i - 1].value : null
      let momChange: string | null = null
      if (prev !== null) {
        const diff = d.value - prev
        const pct = prev > 0 ? Math.round((diff / prev) * 100) : diff > 0 ? 100 : 0
        momChange = diff === 0 ? "—" : diff > 0 ? `+${pct}%` : `${pct}%`
      }
      return {
        ...d,
        rollingAvg: rollingAvgs[i],
        momChange,
      }
    })
  }, [data, dateRange]);

  const monthCount = chartData.length;
  const rangeLabel = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, "MMM yyyy")} – ${format(dateRange.to, "MMM yyyy")}`
    : dateRange?.from
    ? `Since ${format(dateRange.from, "MMM yyyy")}`
    : dateRange?.to
    ? `Up to ${format(dateRange.to, "MMM yyyy")}`
    : "All time";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Event Trend</CardTitle>
        <CardDescription>
          {description || `Events per month (${rangeLabel}, ${monthCount} months).`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <RechartsArea data={chartData} rollingAvgKey="rollingAvg" />
        ) : (
          <div className="flex h-[450px] items-center justify-center text-muted-foreground">
            No events found for the selected period.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
