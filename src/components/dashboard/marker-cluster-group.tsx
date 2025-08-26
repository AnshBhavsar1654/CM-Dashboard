'use client';

import * as React from 'react';
import L from 'leaflet';
import { createPathComponent } from '@react-leaflet/core';
import 'leaflet.markercluster';

/**
 * Groups markers together when they are close to each other on the map.
 * Expands markers into a cluster "spiderfied" view when zoomed in or clicked.
 * Helps improve map performance when displaying a large number of markers.
 */
interface MarkerClusterGroupProps extends L.MarkerClusterGroupOptions {
  children?: React.ReactNode;
}

const MarkerClusterGroup = createPathComponent<
  L.MarkerClusterGroup,       // Underlying Leaflet instance type
  MarkerClusterGroupProps     // Props accepted by this component
>(
  ({ children: _c, ...props }, ctx) => {
    // Create a new MarkerClusterGroup instance with the given options
    const instance = L.markerClusterGroup(props);

    // Return instance + context to ensure child markers are added into this cluster layer
    return {
      instance,
      context: { ...ctx, layerContainer: instance },
    };
  }
);

export default MarkerClusterGroup;
