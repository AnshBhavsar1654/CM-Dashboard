'use client';

import * as React from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { EventData } from '@/lib/types';
import { formatDisplayDate } from '@/lib/date';
import dynamic from 'next/dynamic';
import L from 'leaflet';

// Dynamically import the marker cluster group to avoid SSR issues
const MarkerClusterGroup = dynamic(
  () => import('./marker-cluster-group'),
  { ssr: false }
);

interface ClusterGroupProps {
  data: EventData[];
}

export function ClusterGroup({ data }: ClusterGroupProps) {
  return (
    <MarkerClusterGroup
      maxClusterRadius={40}
      spiderfyOnMaxZoom={true}
      disableClusteringAtZoom={12}
      iconCreateFunction={(cluster) => {
        const count = cluster.getChildCount();
        let className = 'marker-cluster-small';
        
        if (count > 10) {
          className = 'marker-cluster-medium';
        }
        if (count > 20) {
          className = 'marker-cluster-large';
        }
        
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: L.point(40, 40),
        });
      }}
    >
      {data.map((event) => (
        <Marker key={event.id} position={[event.latitude, event.longitude] as [number, number]}>
          <Popup>
            <div>
              <h3 className="font-bold text-base">{event.eventName}</h3>
              <p className="text-sm">
                <span className="font-semibold">Date:</span> {formatDisplayDate(event.date)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Type:</span> {event.type}
              </p>
              <p className="text-sm">
                <span className="font-semibold">District:</span> {event.district}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Location:</span> {event.location}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Department:</span> {event.department}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Distance:</span> {event.distanceTravelled.toFixed(1)} km
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}