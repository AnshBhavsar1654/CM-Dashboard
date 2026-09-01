'use client'

import * as React from 'react'
import { MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DistrictTooltipProps {
  name: string
  count: number
  topTypes: string[]
  covered: boolean
}

export function DistrictTooltip({ name, count, topTypes, covered }: DistrictTooltipProps) {
  const router = useRouter()

  return (
    <div
      className="absolute z-[1000] pointer-events-auto w-56 rounded-xl border border-border bg-card px-4 py-3 shadow-xl"
      style={{ left: 16, top: 16 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        {covered ? (
          <span className="rounded-full bg-palette-covered/15 px-2 py-0.5 text-[10px] font-medium text-palette-covered">
            Visited
          </span>
        ) : (
          <span className="rounded-full bg-palette-attention/15 px-2 py-0.5 text-[10px] font-medium text-palette-attention">
            Not visited
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-headline font-semibold text-foreground tabular-nums">{count}</span>
        <span className="text-xs text-muted-foreground">event{count !== 1 ? 's' : ''}</span>
      </div>

      {topTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {topTypes.map((t) => (
            <span
              key={t}
              className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {count > 0 && (
        <button
          onClick={() => router.push(`/events?district=${encodeURIComponent(name)}`)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-muted py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          <MapPin className="h-3 w-3" />
          View events
        </button>
      )}
    </div>
  )
}
