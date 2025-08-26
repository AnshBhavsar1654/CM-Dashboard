import * as React from "react"
import L from 'leaflet'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { EventData } from "@/lib/types"
import { ClusterGroup } from './cluster-group'

// We override the default paths with explicit URLs from the Leaflet CDN.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * Gujarat bounds (southwest and northeast corners).
 * These bounds ensure the map stays focused on Gujarat.
 */
const GUJARAT_BOUNDS: L.LatLngBoundsExpression = [
    [20.0, 68.0], // Southwest corner
    [25.0, 75.0]  // Northeast corner
];

/**
 * Ensures the map resizes correctly when mounted inside dynamic layouts.
 * Fixes issues where the map sometimes appears "cut off" or not centered.
 */
const MapInvalidateOnMount = () => {
    const map = useMap();
    React.useEffect(() => {
        const id = setTimeout(() => {
            try { 
                map.invalidateSize(); 
            } catch {}
        }, 0);
        return () => clearTimeout(id);
    }, [map]);
    return null;
}

/**
 * Automatically updates the map view based on selected district or shows Gujarat by default.
 * - If a district is selected, zooms to that district's event coordinates.
 * - If no district is selected, zooms to Gujarat bounds.
 */
const MapUpdater = ({ data, selectedDistrict }: { data: EventData[], selectedDistrict?: string }) => {
    const map = useMap();

    React.useEffect(() => {
        // Case 1: A district is selected → Fit map to its events
        if (selectedDistrict) {
            const districtEvents = data.filter(event => event.district === selectedDistrict);
            if (districtEvents.length > 0) {
                // Ignore invalid coordinates (0,0 placeholders)
                const validEvents = districtEvents.filter(event => 
                    event.latitude !== 0 || event.longitude !== 0
                );
                
                if (validEvents.length > 0) {
                    // Compute bounding box around district events
                    const latitudes = validEvents.map(event => event.latitude);
                    const longitudes = validEvents.map(event => event.longitude);
                    
                    const minLat = Math.min(...latitudes);
                    const maxLat = Math.max(...latitudes);
                    const minLng = Math.min(...longitudes);
                    const maxLng = Math.max(...longitudes);
                    
                    // Add padding around the bounds for better UI spacing
                    const padding = 0.01;
                    const bounds: L.LatLngBoundsExpression = [
                        [minLat - padding, minLng - padding],
                        [maxLat + padding, maxLng + padding]
                    ];
                    
                    try { 
                        map.fitBounds(bounds, { 
                            padding: [20, 20], 
                            maxZoom: 12 
                        }); 
                    } catch {}
                }
            }
            return;
        }
        
        // Case 2: No district selected → Reset to Gujarat
        try { 
            map.fitBounds(GUJARAT_BOUNDS, { padding: [10, 10] }); 
        } catch {}
        
        // Ensure proper rendering after updates
        setTimeout(() => {
            try { map.invalidateSize(); } catch {}
        }, 0);
    }, [data, selectedDistrict, map]);

    return null;
}

/**
 * Main LeafletMap component.
 * - Displays a leaflet map with clustering of event markers.
 * - Focuses on Gujarat by default, or on a district when selected.
 */
const LeafletMap = ({ data, selectedDistrict }: { data: EventData[], selectedDistrict?: string }) => {

    // Generate a unique map key in development to avoid re-initialization bugs with HMR
    const [mapKey] = React.useState(() => 
        (process.env.NODE_ENV === 'development' 
            ? Math.random().toString(36).slice(2) 
            : 'stable-map')
    );

    // Prevent rendering until after mount (fix for React 18 double-mounting in StrictMode)
    const [isMounted, setIsMounted] = React.useState(false);

    // Ref to store the map instance
    const mapRef = React.useRef<L.Map | null>(null);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Cleanup: remove map instance on unmount to avoid container reuse errors
    React.useEffect(() => {
        return () => {
            if (mapRef.current) {
                try {
                    mapRef.current.remove();
                } finally {
                    mapRef.current = null;
                }
            }
        };
    }, []);

    // Render placeholder until mounted
    if (!isMounted) {
        return <div className="w-full h-full rounded-md" />;
    }

    return (
        <MapContainer
            id={`leaflet-map-${mapKey}`}
            key={mapKey}
            bounds={GUJARAT_BOUNDS}
            maxBounds={GUJARAT_BOUNDS}
            maxBoundsViscosity={1.0} // Prevents dragging outside Gujarat
            minZoom={6}
            maxZoom={12}
            scrollWheelZoom={true}
            style={{ height: '100%', minHeight: '350px', width: '100%' }}
            className="rounded-md overflow-visible"
        >
            {/* Base map layer (OpenStreetMap tiles) */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Clustered event markers */}
            {data.length > 0 && (
                <React.Suspense fallback={null}>
                    <ClusterGroup data={data} />
                </React.Suspense>
            )}

            {/* Utilities to manage map view and resizing */}
            <MapInvalidateOnMount />
            <MapUpdater data={data} selectedDistrict={selectedDistrict} />
        </MapContainer>
    );
}

export default LeafletMap;