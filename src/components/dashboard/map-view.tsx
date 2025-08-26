"use client";

import * as React from "react";
import type { EventData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const LeafletMap = dynamic(() => import('@/components/dashboard/leaflet-map'), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full" />
});

/**
 * A header with a Map icon, title, and description.
 * The Leaflet map visualization of events, height-adjusted depending on whether a district is selected.
 */
export function MapView({ data, selectedDistrict }: { data: EventData[], selectedDistrict?: string }) {
  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-card to-secondary/10 shadow-sm dark:bg-card">
      {/* Card header with icon, title, and description */}
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <MapIcon className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-headline">Event Map</CardTitle>
        </div>
        <CardDescription>
          Geographic visualization of outreach events
        </CardDescription>
      </CardHeader>

      {/* Card content with responsive Leaflet map */}
      <CardContent className="flex-grow rounded-lg relative">
         <div
            className={`w-full ${
              selectedDistrict
                ? 'h-[400px] md:h-[500px] lg:h-[700px]'  // Larger height when zooming into a district
                : 'h-[300px] md:h-[400px] lg:h-[600px]'  // Slightly smaller when showing all of Gujarat
            } rounded-md overflow-visible`}
            style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }} // Optimized rendering
         >
             {/* Render the Leaflet map */}
             <LeafletMap data={data} selectedDistrict={selectedDistrict} />
         </div>
      </CardContent>
    </Card>
  );
}
