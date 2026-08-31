"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import Image from "next/image"
import { formatDisplayDate } from "@/lib/date"
import type { EventData } from "@/lib/types"

interface PhotoCarouselProps {
  events: EventData[]
}

export function PhotoCarousel({ events }: PhotoCarouselProps) {
  const eventsWithImages = React.useMemo(
    () => events.filter(e => e.imgLink && e.imgLink.trim() !== ""),
    [events]
  )

  const [idx, setIdx] = React.useState(0)
  const [imgError, setImgError] = React.useState(false)
  const [useDirect, setUseDirect] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => { setIdx(0) }, [events])
  React.useEffect(() => { setImgError(false); setLoading(true); setUseDirect(false) }, [idx])

  React.useEffect(() => {
    if (eventsWithImages.length <= 1) return
    const t = setInterval(() => setIdx(p => (p + 1) % eventsWithImages.length), 6000)
    return () => clearInterval(t)
  }, [eventsWithImages.length])

  if (eventsWithImages.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Event Photos</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-muted/30 rounded-lg border border-dashed">
            <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No event photos available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const event = eventsWithImages[idx]
  const src = useDirect
    ? event.imgLink!
    : `/api/image-proxy?url=${encodeURIComponent(event.imgLink!)}&i=${idx}`

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Event Photos</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex-grow flex flex-col items-center justify-center">
        <div className="relative aspect-video w-full min-h-[300px] overflow-hidden rounded-lg bg-muted/30">
          {imgError ? (
            <div className="flex flex-col items-center justify-center h-full">
              <ImageIcon className="h-10 w-10 text-destructive/50 mb-3" />
              <p className="text-destructive text-sm">Image failed to load</p>
            </div>
          ) : (
            <>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                  <div className="animate-pulse">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                </div>
              )}
              <Image
                key={`${idx}-${event.imgLink}`}
                src={src}
                alt={event.eventName}
                fill
                className="object-cover"
                loading="lazy"
                loader={({ src }) => src}
                onLoad={() => setLoading(false)}
                onError={() => { if (!useDirect) setUseDirect(true); else setImgError(true) }}
              />
            </>
          )}

          {/* Caption overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
            <p className="text-sm font-semibold text-white leading-tight truncate">{event.eventName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-white/80">{event.district}</span>
              <span className="text-white/40">·</span>
              <span className="text-xs text-white/80">{formatDisplayDate(event.date, "dd MMM yyyy")}</span>
            </div>
          </div>

          {/* Nav arrows */}
          {eventsWithImages.length > 1 && (
            <>
              <Button
                variant="secondary" size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/70 hover:bg-background/90 backdrop-blur-sm"
                onClick={() => setIdx(p => (p - 1 + eventsWithImages.length) % eventsWithImages.length)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary" size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/70 hover:bg-background/90 backdrop-blur-sm"
                onClick={() => setIdx(p => (p + 1) % eventsWithImages.length)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Position indicator — segmented bar */}
        {eventsWithImages.length > 1 && (
          <div className="flex gap-1 mt-3">
            {eventsWithImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i === idx ? "bg-primary" : "bg-muted-foreground/20 hover:bg-muted-foreground/40"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
