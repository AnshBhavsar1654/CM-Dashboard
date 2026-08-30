"use client";

import * as React from "react";
import type { EventData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const LeafletMap = dynamic(() => import('@/components/dashboard/leaflet-map'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />
});

export function MapView({ data, selectedDistrict }: { data: EventData[], selectedDistrict?: string }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Event Map</CardTitle>
        <CardDescription>Geographic visualization of outreach events</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div
          className={`w-full ${
            selectedDistrict
              ? 'h-[400px] md:h-[500px] lg:h-[700px]'
              : 'h-[300px] md:h-[400px] lg:h-[600px]'
          } rounded-lg overflow-hidden`}
          style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}
        >
          <LeafletMap data={data} selectedDistrict={selectedDistrict} />
        </div>
      </CardContent>
    </Card>
  );
}
