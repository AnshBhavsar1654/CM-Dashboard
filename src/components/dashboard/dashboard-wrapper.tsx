// Provides a "skeleton UI" placeholder while the actual dashboard content is being loaded asynchronously.

"use client";

import * as React from "react";
import { Suspense } from "react";
import type { EventData } from "@/lib/types";
import { Dashboard } from "./dashboard";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Title skeleton + small metrics section */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-[200px]" /> {/* Placeholder for dashboard heading */}
        
        {/* Placeholder for 4 metric/stat cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>

      {/* Two large side-by-side sections (charts or widgets) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>

      {/* Two more stacked sections (could be tables, charts, lists) */}
      <Skeleton className="h-[400px]" />
      <Skeleton className="h-[400px]" />
    </div>
  );
}

/**
 * Wraps the `Dashboard` component inside React's `Suspense`so that while the data is being prepared/streamed,
 * the `DashboardSkeleton` is shown as a fallback UI.
 */
export function DashboardWrapper({ initialEvents }: { initialEvents: EventData[] }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard initialEvents={initialEvents} />
    </Suspense>
  );
}
