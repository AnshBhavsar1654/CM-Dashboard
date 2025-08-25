import * as React from "react"
import L from 'leaflet'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { EventData } from "@/lib/types"
import { ClusterGroup } from './cluster-group'

// Fix for default icon path issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Gujarat bounds (SW and NE corners) - adjusted for better coverage
const GUJARAT_BOUNDS: L.LatLngBoundsExpression = [
    [20.0, 68.0],
    [25.0, 75.0]
];

const MapInvalidateOnMount = () => {
    const map = useMap();
    React.useEffect(() => {
        const id = setTimeout(() => {
            try { map.invalidateSize(); } catch {}
        }, 0);
        return () => clearTimeout(id);
    }, [map]);
    return null;
}

// Fit the map view to Gujarat when no district is selected, or to the district when one is selected
const MapUpdater = ({ data, selectedDistrict }: { data: EventData[], selectedDistrict?: string }) => {
    const map = useMap();
    React.useEffect(() => {
        // If a district is selected, fit to the bounds of events in that district
        if (selectedDistrict) {
            const districtEvents = data.filter(event => event.district === selectedDistrict);
            if (districtEvents.length > 0) {
                // Calculate bounds based on event coordinates
                const validEvents = districtEvents.filter(event => 
                    event.latitude !== 0 || event.longitude !== 0
                );
                
                if (validEvents.length > 0) {
                    const latitudes = validEvents.map(event => event.latitude);
                    const longitudes = validEvents.map(event => event.longitude);
                    
                    const minLat = Math.min(...latitudes);
                    const maxLat = Math.max(...latitudes);
                    const minLng = Math.min(...longitudes);
                    const maxLng = Math.max(...longitudes);
                    
                    // Add some padding
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
        
        // Focus on Gujarat bounds by default when no district is selected
        try { map.fitBounds(GUJARAT_BOUNDS, { padding: [10, 10] }); } catch {}
        // Ensure proper sizing after updates
        setTimeout(() => {
            try { map.invalidateSize(); } catch {}
        }, 0);
    }, [data, selectedDistrict, map]);
    return null;
}

const LeafletMap = ({ data, selectedDistrict }: { data: EventData[], selectedDistrict?: string }) => {

    // Overlays removed: no masking or polygon; plain map view within Gujarat bounds
    // Ensure a unique map container per component instance to avoid re-initialization errors in dev/HMR
    const [mapKey] = React.useState(() => (process.env.NODE_ENV === 'development' ? Math.random().toString(36).slice(2) : 'stable-map'));
    // In React 18 Strict Mode, effects mount/unmount twice in dev. Delay rendering the map until after mount.
    const [isMounted, setIsMounted] = React.useState(false);
	const mapRef = React.useRef<L.Map | null>(null);
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

	// Explicitly remove the map instance on unmount to avoid container reuse issues during HMR/StrictMode
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

    if (!isMounted) {
        return <div className="w-full h-full rounded-md" />;
    }

    return (
        <MapContainer
            id={`leaflet-map-${mapKey}`}
            key={mapKey}
            bounds={GUJARAT_BOUNDS}
            maxBounds={GUJARAT_BOUNDS}
            maxBoundsViscosity={1.0}
            minZoom={6}
            maxZoom={12}
            scrollWheelZoom={true}

            style={{ height: '100%', minHeight: '350px', width: '100%' }}
            className="rounded-md overflow-visible"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Use dynamic import for MarkerClusterGroup */}
            {data.length > 0 && (
                <React.Suspense fallback={null}>
                    <ClusterGroup data={data} />
                </React.Suspense>
            )}
            <MapInvalidateOnMount />
            <MapUpdater data={data} selectedDistrict={selectedDistrict} />
        </MapContainer>
    );
}

export default LeafletMap;
