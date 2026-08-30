"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import type { EventData } from "@/lib/types";

interface ImageCarouselProps {
  events: EventData[];
}

export function ImageCarousel({ events }: ImageCarouselProps) {
  const eventsWithImages = React.useMemo(() => {
    return events.filter(event => event.imgLink && event.imgLink.trim() !== "");
  }, [events]);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const [useDirectUrl, setUseDirectUrl] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  React.useEffect(() => {
    setCurrentIndex(0);
    setImageError(null);
    setImageLoading(true);
    setUseDirectUrl(false);
  }, [events]);

  React.useEffect(() => {
    setImageError(null);
    setImageLoading(true);
    setUseDirectUrl(false);
  }, [currentIndex, eventsWithImages]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || eventsWithImages.length === 0) return;
    const imagePromises = eventsWithImages.map((event, index) => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = `/api/image-proxy?url=${encodeURIComponent(event.imgLink!)}&i=${index}`;
      });
    });
    Promise.allSettled(imagePromises);
  }, [eventsWithImages]);

  React.useEffect(() => {
    if (eventsWithImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => prevIndex === eventsWithImages.length - 1 ? 0 : prevIndex + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [eventsWithImages.length]);

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => prevIndex === 0 ? eventsWithImages.length - 1 : prevIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => prevIndex === eventsWithImages.length - 1 ? 0 : prevIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (eventsWithImages.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            Event Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[250px] bg-muted/30 rounded-lg border border-dashed">
            <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No event photos available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentEvent = eventsWithImages[currentIndex];
  if (!currentEvent) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            Event Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[250px] bg-muted/30 rounded-lg border border-dashed">
            <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No event photos available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          Event Photos
        </CardTitle>
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1} / {eventsWithImages.length}
        </span>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex-grow flex flex-col">
        <div className="relative aspect-video w-full min-h-[250px] overflow-hidden rounded-lg bg-muted/30 flex-grow">
          {currentEvent.imgLink ? (
            <>
              {imageError ? (
                <div className="flex flex-col items-center justify-center h-full w-full bg-muted/30 rounded-lg">
                  <ImageIcon className="h-10 w-10 text-destructive/50 mb-3" />
                  <p className="text-destructive text-sm text-center px-4">Image failed to load</p>
                </div>
              ) : (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-lg">
                      <div className="animate-pulse flex flex-col items-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
                      </div>
                    </div>
                  )}
                  <img
                    key={`${currentIndex}-${currentEvent.imgLink}`}
                    src={useDirectUrl
                      ? `${currentEvent.imgLink}`
                      : `/api/image-proxy?url=${encodeURIComponent(currentEvent.imgLink)}&i=${currentIndex}`}
                    alt={currentEvent.eventName || "Event photo"}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading={currentIndex === 0 ? "eager" : "lazy"}
                    decoding="async"
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      if (!useDirectUrl) { setUseDirectUrl(true); return; }
                      setImageError("Failed to load image");
                    }}
                  />
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-muted/30 rounded-lg">
              <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No image available</p>
            </div>
          )}

          {eventsWithImages.length > 1 && (
            <>
              <Button variant="secondary" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 hover:bg-background" onClick={goToPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 hover:bg-background" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {eventsWithImages.length > 1 && (
          <div className="flex justify-center mt-3 gap-1.5">
            {eventsWithImages.map((_, index) => (
              <button
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
