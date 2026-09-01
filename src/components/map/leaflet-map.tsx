import * as React from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { EventData } from '@/lib/types'
import { MapLegend } from './map-legend'
import { DistrictTooltip } from './district-tooltip'

const GUJARAT_BOUNDS: L.LatLngBoundsExpression = [
  [20.0, 68.0],
  [25.0, 75.0]
]

const GEOJSON_URL = 'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/states/gujarat.geojson'

const GUJARAT_DISTRICTS = [
  'Ahmedabad', 'Gandhinagar', 'Mahesana', 'Banaskantha', 'Sabarkantha',
  'Aravalli', 'Patan', 'Rajkot', 'Surat', 'Vadodara', 'Anand', 'Amreli',
  'Kheda', 'Kutch', 'Bhavnagar', 'Dahod', 'Panchmahal', 'Porbandar',
  'Gir Somnath', 'Mahisagar', 'Narmada', 'Bharuch', 'Jamnagar', 'Navsari',
  'Valsad', 'Junagadh', 'Surendranagar', 'Tapi', 'Dang', 'Devbhoomi Dwarka',
  'Morbi', 'Botad', 'Chhota Udepur',
]

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function getMarkerColor(count: number, max: number): string {
  if (count === 0) return '#d97706'
  const ratio = count / max
  if (ratio < 0.25) return '#0d9488'
  if (ratio < 0.5) return '#14b8a6'
  if (ratio < 0.75) return '#f59e0b'
  return '#ef4444'
}

function createDistrictIcon(count: number, color: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px;
      background: ${color};
      border: 2.5px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      font-family: inherit;
      line-height: 1;
    ">${count}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

const MapInvalidateOnMount = () => {
  const map = useMap()
  React.useEffect(() => {
    const id = setTimeout(() => {
      try { map.invalidateSize() } catch {}
    }, 0)
    return () => clearTimeout(id)
  }, [map])
  return null
}

const MapUpdater = ({ selectedDistrict }: { selectedDistrict?: string }) => {
  const map = useMap()
  React.useEffect(() => {
    if (!selectedDistrict) {
      try { map.fitBounds(GUJARAT_BOUNDS, { padding: [10, 10] }) } catch {}
      setTimeout(() => { try { map.invalidateSize() } catch {} }, 0)
    }
  }, [selectedDistrict, map])
  return null
}

function ZoomTracker({ onZoom }: { onZoom: (z: number) => void }) {
  useMapEvents({ zoomend: (e) => onZoom(e.target.getZoom()) })
  return null
}

const DistrictBoundary = React.memo(function DistrictBoundary({
  onHover, onClick, districtCounts, districtTopTypes
}: {
  onHover: (info: { name: string; count: number; topTypes: string[]; covered: boolean } | null) => void
  onClick: (name: string) => void
  districtCounts: Record<string, number>
  districtTopTypes: Record<string, string[]>
}) {
  const map = useMap()
  const layerRef = React.useRef<L.GeoJSON | null>(null)

  React.useEffect(() => {
    let cancelled = false

    fetch(GEOJSON_URL)
      .then(r => r.json())
      .then((geojson: any) => {
        if (cancelled) return

        const geoLayer = L.geoJSON(geojson, {
          style: (feature) => {
            const name = feature?.properties?.district
            const count = districtCounts[name] || 0
            const covered = count > 0
            return {
              fillColor: covered ? '#0d9488' : 'transparent',
              fillOpacity: covered ? 0.15 : 0,
              color: covered ? '#0d9488' : '#d97706',
              weight: covered ? 2 : 1.5,
              dashArray: covered ? undefined : '5 5',
            }
          },
          onEachFeature: (feature, layer) => {
            const name = feature.properties?.district || 'Unknown'
            const count = districtCounts[name] || 0
            const covered = count > 0
            const topTypes = districtTopTypes[name] || []

            layer.on('mouseover', function (this: any) {
              this.setStyle({ weight: 2.5, fillOpacity: covered ? 0.2 : 0.08, color: covered ? '#0d9488' : '#d97706' })
              onHover({ name, count, topTypes, covered })
            })
            layer.on('mouseout', function (this: any) {
              this.setStyle({
                fillColor: covered ? '#0d9488' : 'transparent',
                fillOpacity: covered ? 0.15 : 0,
                color: covered ? '#0d9488' : '#d97706',
                weight: covered ? 2 : 1.5,
                dashArray: covered ? undefined : '5 5',
              })
              onHover(null)
            })
            layer.on('click', () => onClick(name))
          }
        }).addTo(map)
        layerRef.current = geoLayer
      })
      .catch(() => {})

    return () => {
      cancelled = true
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
    }
  }, [map, districtCounts, districtTopTypes, onHover, onClick])

  return null
})

function DistrictMarkers({
  data, districtCounts, districtCentroids, maxCount
}: {
  data: EventData[]
  districtCounts: Record<string, number>
  districtCentroids: Record<string, { lat: number; lng: number }>
  maxCount: number
}) {
  const map = useMap()

  return (
    <>
      {Object.entries(districtCentroids).map(([district, { lat, lng }]) => {
        const count = districtCounts[district]
        if (count === 0) return null
        const color = getMarkerColor(count, maxCount)
        return (
          <Marker
            key={district}
            position={[lat, lng]}
            icon={createDistrictIcon(count, color)}
            eventHandlers={{
              click: () => {
                const events = data.filter(e => e.district === district && (e.latitude !== 0 || e.longitude !== 0))
                if (events.length > 0) {
                  const lats = events.map(e => e.latitude)
                  const lngs = events.map(e => e.longitude)
                  const bounds: L.LatLngBoundsExpression = [
                    [Math.min(...lats) - 0.02, Math.min(...lngs) - 0.02],
                    [Math.max(...lats) + 0.02, Math.max(...lngs) + 0.02]
                  ]
                  map.fitBounds(bounds, { padding: [30, 30], maxZoom: 11 })
                }
              }
            }}
          />
        )
      })}
    </>
  )
}

function EventMarkers({
  data, districtCounts, maxCount
}: {
  data: EventData[]
  districtCounts: Record<string, number>
  maxCount: number
}) {
  return (
    <>
      {data
        .filter(e => e.latitude !== 0 || e.longitude !== 0)
        .map(event => (
          <CircleMarker
            key={event.id}
            center={[event.latitude, event.longitude]}
            radius={6}
            fillColor={getMarkerColor(districtCounts[event.district] || 0, maxCount)}
            fillOpacity={0.85}
            color="#fff"
            weight={2}
            opacity={0.9}
            eventHandlers={{
              mouseover: function (this: any) {
                this.setStyle({ radius: 9, weight: 3 })
                this.bindTooltip(
                  `<div style="min-width:160px">
                    <div style="font-weight:600;font-size:13px;margin-bottom:4px;line-height:1.3">${event.eventName}</div>
                    <div style="font-size:11px;color:#666;margin-bottom:2px">${event.district} &middot; ${event.location}</div>
                    <div style="font-size:11px;color:#666;margin-bottom:2px">${event.type}</div>
                    <div style="font-size:10px;color:#999">${new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>`,
                  { direction: 'top', offset: [0, -10], className: 'event-marker-tooltip' }
                )
                this.openTooltip()
              },
              mouseout: function (this: any) {
                this.setStyle({ radius: 6, weight: 2 })
                this.unbindTooltip()
              },
            }}
          />
        ))
      }
    </>
  )
}

interface LeafletMapProps {
  data: EventData[]
  selectedDistrict?: string
}

const LeafletMap = ({ data, selectedDistrict }: LeafletMapProps) => {
  const [mapKey] = React.useState(() =>
    process.env.NODE_ENV === 'development'
      ? Math.random().toString(36).slice(2)
      : 'stable-map'
  )
  const [isMounted, setIsMounted] = React.useState(false)
  const [zoom, setZoom] = React.useState(7)
  const [hoverInfo, setHoverInfo] = React.useState<{
    name: string; count: number; topTypes: string[]; covered: boolean
  } | null>(null)

  React.useEffect(() => { setIsMounted(true) }, [])

  const { districtCounts, districtTopTypes, maxCount, districtCentroids } = React.useMemo(() => {
    const counts: Record<string, number> = {}
    const topTypes: Record<string, string[]> = {}
    const centroids: Record<string, { lat: number; lng: number }> = {}
    GUJARAT_DISTRICTS.forEach(d => { counts[d] = 0; topTypes[d] = [] })

    data.forEach(e => {
      if (e.district && counts[e.district] !== undefined) {
        counts[e.district]++
      }
    })

    Object.keys(counts).forEach(d => {
      const events = data.filter(e => e.district === d)
      const types = events.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc }, {} as Record<string, number>)
      topTypes[d] = Object.entries(types).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t)

      const validEvents = events.filter(e => e.latitude !== 0 || e.longitude !== 0)
      if (validEvents.length > 0) {
        const lat = validEvents.reduce((s, e) => s + e.latitude, 0) / validEvents.length
        const lng = validEvents.reduce((s, e) => s + e.longitude, 0) / validEvents.length
        centroids[d] = { lat, lng }
      }
    })

    return {
      districtCounts: counts,
      districtTopTypes: topTypes,
      maxCount: Math.max(...Object.values(counts), 1),
      districtCentroids: centroids,
    }
  }, [data])

  const handleDistrictClick = React.useCallback((name: string) => {
    window.location.href = `/events?district=${encodeURIComponent(name)}`
  }, [])

  const showDistrictMarkers = zoom < 10

  if (!isMounted) {
    return <div className="w-full h-full rounded-md" />
  }

  return (
    <div className="relative h-full w-full">
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
        className="rounded-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <DistrictBoundary
          onHover={setHoverInfo}
          onClick={handleDistrictClick}
          districtCounts={districtCounts}
          districtTopTypes={districtTopTypes}
        />

        {showDistrictMarkers ? (
          <DistrictMarkers
            data={data}
            districtCounts={districtCounts}
            districtCentroids={districtCentroids}
            maxCount={maxCount}
          />
        ) : (
          <EventMarkers
            data={data}
            districtCounts={districtCounts}
            maxCount={maxCount}
          />
        )}

        <ZoomTracker onZoom={setZoom} />
        <MapInvalidateOnMount />
        <MapUpdater selectedDistrict={selectedDistrict} />
      </MapContainer>

      <MapLegend />

      {hoverInfo && (
        <DistrictTooltip
          name={hoverInfo.name}
          count={hoverInfo.count}
          topTypes={hoverInfo.topTypes}
          covered={hoverInfo.covered}
        />
      )}
    </div>
  )
}

export default LeafletMap
