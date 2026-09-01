'use client'

const LEGEND_ITEMS = [
  { color: '#0d9488', label: 'Low density (1-25%)' },
  { color: '#14b8a6', label: 'Medium (25-50%)' },
  { color: '#f59e0b', label: 'High (50-75%)' },
  { color: '#ef4444', label: 'Very high (75%+)' },
]

export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Event Density
      </p>
      <div className="flex flex-col gap-1.5">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-foreground/80">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="my-2 border-t border-border" />
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        District Boundaries
      </p>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-block h-0 w-4 border-t-2 border-dashed" style={{ borderColor: '#d97706' }} />
          <span className="text-xs text-foreground/80">Not yet visited</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-0 w-4 border-t-2" style={{ borderColor: '#0d9488' }} />
          <span className="text-xs text-foreground/80">Visited</span>
        </div>
      </div>
    </div>
  )
}
