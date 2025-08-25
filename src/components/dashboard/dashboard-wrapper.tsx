"use client";

import * as React from "react";
import { Suspense } from "react";
import type { EventData } from "@/lib/types";
import { Dashboard } from "./dashboard";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
      <Skeleton className="h-[400px]" />
      <Skeleton className="h-[400px]" />
    </div>
  );
}

export function DashboardWrapper({ initialEvents }: { initialEvents: EventData[] }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard initialEvents={initialEvents} />
    </Suspense>
  );
}
