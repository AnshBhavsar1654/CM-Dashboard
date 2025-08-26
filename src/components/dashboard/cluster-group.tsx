// Renders clustered map markers using react-leaflet + leaflet.markercluster
// Groups nearby event markers and displays popup info when clicked

'use client';

import * as React from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { EventData } from '@/lib/types';
import { formatDisplayDate } from '@/lib/date';
import dynamic from 'next/dynamic';
import L from 'leaflet';

// Dynamically import the marker cluster group to avoid SSR issues in Next.js
const MarkerClusterGroup = dynamic(
  () => import('./marker-cluster-group'),
  { ssr: false }
);

interface ClusterGroupProps {
  data: EventData[]; // Array of event data containing location + metadata
}

/**
 * ClusterGroup component: Displays a cluster of event markers on a Leaflet map.
 * Groups markers into clusters at lower zoom levels
 * Custom cluster icons (small, medium, large) based on child count
 * Each marker shows a popup with event details
 */
export function ClusterGroup({ data }: ClusterGroupProps) {
  return (
    <MarkerClusterGroup
      maxClusterRadius={40}            // radius for grouping markers into clusters
      spiderfyOnMaxZoom={true}         // expand cluster markers when zoomed in
      disableClusteringAtZoom={12}     // stop clustering at zoom level 12
      
      // Gets number of markers in cluster (`count`)
      // Assigns style class depending on cluster size (small, medium, large)
      iconCreateFunction={(cluster) => {
        // Get number of markers in the cluster
        const count = cluster.getChildCount();

        // Assign different styles based on cluster size
        let className = 'marker-cluster-small';
        if (count > 10) {
          className = 'marker-cluster-medium';
        }
        if (count > 20) {
          className = 'marker-cluster-large';
        }

        // Create a custom Leaflet divIcon with count number
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: L.point(40, 40), // cluster circle size
        });
      }}
    >
      {/* Render each event as a map marker */}
      {data.map((event) => (
        <Marker
          key={event.id}
          position={[event.latitude, event.longitude] as [number, number]}
        >
          {/* Popup with event details */}
          <Popup>
            <div>
              <h3 className="font-bold text-base">{event.eventName}</h3>
              <p className="text-sm">
                <span className="font-semibold">Date:</span>{' '}
                {formatDisplayDate(event.date)}
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
                <span className="font-semibold">Distance:</span>{' '}
                {event.distanceTravelled.toFixed(1)} km
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}