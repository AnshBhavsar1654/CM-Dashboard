"use client"

import type { EventData } from "@/lib/types"
import { Building2, Handshake, CalendarDays, Megaphone, Ellipsis, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface CategoryStat {
  label: string
  value: number
  icon: LucideIcon
  filterFn: (e: EventData) => boolean
}

function computeTrend(events: EventData[], filterFn: (e: EventData) => boolean) {
  const filtered = events.filter(filterFn)
  if (filtered.length === 0) return "neutral" as const

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

  const cur = getMonthCount(0)
  const prev = getMonthCount(1)

  if (prev === 0 && cur === 0) return "neutral" as const
  if (prev === 0) return "up" as const
  const ratio = cur / prev
  if (ratio > 1.05) return "up" as const
  if (ratio < 0.95) return "down" as const
  return "neutral" as const
}

export function CategoryBreakdown({ events }: { events: EventData[] }) {
  const categories: CategoryStat[] = [
    { label: "Govt.", value: events.filter(e => e.type.toLowerCase() === "government event").length, icon: Building2, filterFn: e => e.type.toLowerCase() === "government event" },
    { label: "Public", value: events.filter(e => e.type.toLowerCase() === "public event").length, icon: Handshake, filterFn: e => e.type.toLowerCase() === "public event" },
    { label: "Cultural", value: events.filter(e => e.type.toLowerCase() === "cultural & religious event").length, icon: CalendarDays, filterFn: e => e.type.toLowerCase() === "cultural & religious event" },
    { label: "Social", value: events.filter(e => e.type.toLowerCase() === "social event").length, icon: Handshake, filterFn: e => e.type.toLowerCase() === "social event" },
    { label: "Political", value: events.filter(e => e.type.toLowerCase() === "political event").length, icon: Megaphone, filterFn: e => e.type.toLowerCase() === "political event" },
    { label: "Other", value: events.filter(e => ["other event", "private event", "personal event"].includes(e.type.toLowerCase())).length, icon: Ellipsis, filterFn: e => ["other event", "private event", "personal event"].includes(e.type.toLowerCase()) },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {categories.map((cat) => {
        const trend = computeTrend(events, cat.filterFn)
        const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
        const trendColor = trend === "up" ? "text-palette-covered" : trend === "down" ? "text-palette-attention" : "text-muted-foreground"
        return (
          <div key={cat.label} className="rounded-lg border bg-card p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <cat.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <TrendIcon className={`h-3 w-3 ${trendColor}`} />
            </div>
            <span className="text-xl font-headline font-semibold text-foreground tabular-nums">{cat.value}</span>
            <span className="text-[11px] text-muted-foreground">{cat.label}</span>
          </div>
        )
      })}
    </div>
  )
}
