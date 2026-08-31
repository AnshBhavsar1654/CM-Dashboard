"use client"

import * as React from "react"
import type { EventData } from "@/lib/types"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const COLORS = {
  positive: "#0d9488",
  negative: "#d97706",
  neutral: "#94a3b8",
}

function SparklineSVG({ data, color }: { data: number[]; color: string }) {
  const w = 72
  const h = 24
  const pad = 3

  if (data.every(v => v === 0)) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
        <line x1={pad} y1={h / 2} x2={w - pad} y2={h / 2} stroke={COLORS.neutral} strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" />
      </svg>
    )
  }

  const max = Math.max(...data, 1)
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - (v / max) * (h - pad * 2)
    return `${x},${y}`
  })

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points.join(" ")} />
      <circle cx={points[points.length - 1].split(",")[0]} cy={points[points.length - 1].split(",")[1]} r="2.5" fill={color} />
    </svg>
  )
}

interface TrendSparklineProps {
  events: EventData[]
  filterFn?: (event: EventData) => boolean
}

export function TrendSparkline({ events, filterFn }: TrendSparklineProps) {
  const { delta, color, label, monthlyData } = React.useMemo(() => {
    const filtered = filterFn ? events.filter(filterFn) : events
    if (filtered.length === 0) {
      return { delta: 0, color: COLORS.neutral, label: "—", monthlyData: [] }
    }

    const sorted = [...filtered].sort((a, b) => a.eventDateMs - b.eventDateMs)
    const lastDate = new Date(sorted[sorted.length - 1].eventDateMs)
    const refMonth = lastDate.getMonth()
    const refYear = lastDate.getFullYear()

    const getMonthCount = (offset: number) => {
      const d = new Date(refYear, refMonth - offset, 1)
      const start = d.getTime()
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime()
      return filtered.filter(e => e.eventDateMs >= start && e.eventDateMs <= end).length
    }

    const thisMonth = getMonthCount(0)
    const lastMonth = getMonthCount(1)
    const monthlyData = Array.from({ length: 6 }, (_, i) => getMonthCount(5 - i))

    const diff = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : thisMonth > 0 ? 100 : 0
    const rounded = Math.round(diff)
    const color = rounded > 0 ? COLORS.positive : rounded < 0 ? COLORS.negative : COLORS.neutral
    const label = rounded > 0 ? `+${rounded}%` : rounded === 0 ? "0%" : `${rounded}%`

    return { delta: rounded, color, label, monthlyData }
  }, [events, filterFn])

  return (
    <div className="flex items-center gap-2 shrink-0">
      {monthlyData.length >= 2 && <SparklineSVG data={monthlyData} color={color} />}
      <div className="flex items-center gap-0.5">
        {delta > 0 && <TrendingUp style={{ color }} className="h-3 w-3" />}
        {delta < 0 && <TrendingDown style={{ color }} className="h-3 w-3" />}
        {delta === 0 && <Minus style={{ color }} className="h-3 w-3" />}
        <span className="text-xs font-medium tabular-nums" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  )
}
