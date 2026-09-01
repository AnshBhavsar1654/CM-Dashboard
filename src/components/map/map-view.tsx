"use client";

import * as React from "react";
import type { EventData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const LeafletMap = dynamic(() => import('@/components/map/leaflet-map'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-lg" />
});

export function MapView({ data, selectedDistrict }: { data: EventData[], selectedDistrict?: string }) {
  return (
    <div
      className={`w-full rounded-lg overflow-hidden ${
        selectedDistrict
          ? 'h-[300px] md:h-[400px] lg:h-[550px]'
          : 'h-[250px] md:h-[350px] lg:h-[500px]'
      }`}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '500px' }}
    >
      <LeafletMap data={data} selectedDistrict={selectedDistrict} />
    </div>
  );
}
