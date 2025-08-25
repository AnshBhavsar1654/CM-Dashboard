'use client';

import * as React from 'react';
import L from 'leaflet';
import { createPathComponent } from '@react-leaflet/core';
import 'leaflet.markercluster';

// Define the props interface to include all the properties we're using
interface MarkerClusterGroupProps extends L.MarkerClusterGroupOptions {
  children?: React.ReactNode;
}

const MarkerClusterGroup = createPathComponent<L.MarkerClusterGroup, MarkerClusterGroupProps>(
  ({ children: _c, ...props }, ctx) => {
    const instance = L.markerClusterGroup(props);

    return {
      instance,
      context: { ...ctx, layerContainer: instance },
    };
  }
);

export default MarkerClusterGroup;