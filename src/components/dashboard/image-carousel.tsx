"use client";
/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import type { EventData } from "@/lib/types";

interface ImageCarouselProps {
  events: EventData[];
}

export function ImageCarousel({ events }: ImageCarouselProps) {
  // Filter events that have image links
  const eventsWithImages = React.useMemo(() => {
    return events.filter(event => event.imgLink && event.imgLink.trim() !== "");
  }, [events]);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const [useDirectUrl, setUseDirectUrl] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  // Reset index and error state when events change
  React.useEffect(() => {
    setCurrentIndex(0);
    setImageError(null);
    setImageLoading(true);
    setUseDirectUrl(false);
  }, [events]);

  // Reset image error and loading state when current image changes
  React.useEffect(() => {
    setImageError(null);
    setImageLoading(true);
    setUseDirectUrl(false);
  }, [currentIndex, eventsWithImages]);

  // Preload all images when carousel loads
  React.useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || eventsWithImages.length === 0) return;

    const imagePromises = eventsWithImages.map((event, index) => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = `/api/image-proxy?url=${encodeURIComponent(event.imgLink!)}&i=${index}`;
      });
    });

    // We don't need to wait for all images to load, but we can catch any errors
    Promise.allSettled(imagePromises).then(results => {
      const failedLoads = results.filter(result => result.status === 'rejected').length;
      if (failedLoads > 0) {
        console.warn(`${failedLoads} images failed to preload in carousel`);
      }
    });
  }, [eventsWithImages]);

  // Auto-advance carousel every 5 seconds
  React.useEffect(() => {
    if (eventsWithImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === eventsWithImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [eventsWithImages.length]);

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? eventsWithImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === eventsWithImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (eventsWithImages.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-card via-card/95 to-amber-500/5 border border-amber-500/20 shadow-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300 hover:scale-105 group dark:bg-card dark:border-amber-500/50 dark:hover:shadow-amber-500/30 dark:hover:border-amber-500/60 mx-auto w-full h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <ImageIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Event Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 flex-grow flex flex-col">
          <div className="flex flex-col items-center justify-center h-full min-h-[250px] bg-muted/20 rounded-lg border-2 border-dashed border-muted flex-grow">
            <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-center">
              No event photos available
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 text-center">
              Images will appear here when added to events
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentEvent = eventsWithImages[currentIndex];
  
  // Check if currentEvent is valid
  if (!currentEvent) {
    return (
      <Card className="bg-gradient-to-br from-card via-card/95 to-amber-500/5 border border-amber-500/20 shadow-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300 hover:scale-105 group dark:bg-card dark:border-amber-500/50 dark:hover:shadow-amber-500/30 dark:hover:border-amber-500/60 mx-auto w-full h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <ImageIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Event Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 flex-grow flex flex-col">
          <div className="flex flex-col items-center justify-center h-full min-h-[250px] bg-muted/20 rounded-lg border-2 border-dashed border-muted flex-grow">
            <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-center">
              No event photos available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-amber-500/5 border border-amber-500/20 shadow-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300 hover:scale-105 group dark:bg-card dark:border-amber-500/50 dark:hover:shadow-amber-500/30 dark:hover:border-amber-500/60 mx-auto w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold truncate">
          <ImageIcon className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="truncate">Event Photos</span>
        </CardTitle>
        <span className="text-xs font-normal text-muted-foreground ml-auto flex-shrink-0">
          {currentIndex + 1} of {eventsWithImages.length}
        </span>
      </CardHeader>
      <CardContent className="p-3 flex-grow flex flex-col">
        <div className="relative aspect-video w-full min-h-[250px] overflow-hidden rounded-lg bg-muted/20 flex-grow">
          {currentEvent && currentEvent.imgLink ? (
            <>
              {imageError ? (
                <div className="flex flex-col items-center justify-center h-full w-full bg-muted/20 rounded-lg">
                  <ImageIcon className="h-10 w-10 text-destructive/50 mb-3" />
                  <p className="text-destructive text-sm text-center px-4">Image failed to load</p>
                  <p className="text-xs text-muted-foreground text-center px-4 mt-1">
                    {currentEvent.imgLink}
                  </p>
                </div>
              ) : (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-lg">
                      <div className="animate-pulse flex flex-col items-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground text-sm">Loading image...</p>
                      </div>
                    </div>
                  )}
                  <img
                    key={`${currentIndex}-${currentEvent.imgLink}`}
                    src={useDirectUrl
                      ? `${currentEvent.imgLink}`
                      : `/api/image-proxy?url=${encodeURIComponent(currentEvent.imgLink)}&i=${currentIndex}`}
                    alt={currentEvent.eventName || currentEvent.id?.toString() || "Event photo"}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    loading={currentIndex === 0 ? "eager" : "lazy"}
                    decoding="async"
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      if (!useDirectUrl) {
                        // Fallback to direct URL if proxy fails
                        setUseDirectUrl(true);
                        return;
                      }
                      setImageError(`Failed to load image`);
                    }}
                  />
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-muted/20 rounded-lg">
              <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}
          
          {/* Navigation buttons */}
          {eventsWithImages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 border border-border"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 border border-border"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        
        
        {/* Dot indicators */}
        {eventsWithImages.length > 1 && (
          <div className="flex justify-center mt-3 space-x-2 flex-shrink-0">
            {eventsWithImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-muted"
                }`}
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