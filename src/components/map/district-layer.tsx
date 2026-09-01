'use client'

import * as React from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import type { EventData } from '@/lib/types'

const GEOJSON_URL = 'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/states/gujarat.geojson'

const GUJARAT_DISTRICTS = [
  'Ahmedabad', 'Gandhinagar', 'Mahesana', 'Banaskantha', 'Sabarkantha',
  'Aravalli', 'Patan', 'Rajkot', 'Surat', 'Vadodara', 'Anand', 'Amreli',
  'Kheda', 'Kutch', 'Bhavnagar', 'Dahod', 'Panchmahal', 'Porbandar',
  'Gir Somnath', 'Mahisagar', 'Narmada', 'Bharuch', 'Jamnagar', 'Navsari',
  'Valsad', 'Junagadh', 'Surendranagar', 'Tapi', 'Dang', 'Devbhoomi Dwarka',
  'Morbi', 'Botad', 'Chhota Udepur',
]

function getColor(count: number, max: number): string {
  if (count === 0) return '#d97706'
  const ratio = count / max
  if (ratio < 0.25) return '#0d9488'
  if (ratio < 0.5) return '#14b8a6'
  if (ratio < 0.75) return '#f59e0b'
  return '#ef4444'
}

function getRadius(count: number, max: number): number {
  if (count === 0) return 0
  const ratio = count / max
  return 8 + ratio * 20
}

interface DistrictLayerProps {
  events: EventData[]
  onDistrictHover: (info: { name: string; count: number; topTypes: string[]; covered: boolean; lat: number; lng: number } | null) => void
  onDistrictClick: (name: string) => void
}

export function DistrictLayer({ events, onDistrictHover, onDistrictClick }: DistrictLayerProps) {
  const map = useMap()
  const layerRef = React.useRef<L.GeoJSON | null>(null)
  const markersRef = React.useRef<L.LayerGroup | null>(null)

  const districtData = React.useMemo(() => {
    const grouped: Record<string, EventData[]> = {}
    GUJARAT_DISTRICTS.forEach(d => { grouped[d] = [] })
    events.forEach(e => {
      if (e.district && grouped[e.district]) {
        grouped[e.district].push(e)
      }
    })

    const counts = Object.values(grouped).map(e => e.length)
    const maxCount = Math.max(...counts, 1)

    return { grouped, maxCount }
  }, [events])

  React.useEffect(() => {
    let cancelled = false

    fetch(GEOJSON_URL)
      .then(r => r.json())
      .then((geojson: any) => {
        if (cancelled) return

        const { grouped, maxCount } = districtData

        const geoLayer = L.geoJSON(geojson, {
          style: (feature) => {
            const name = feature?.properties?.district
            const count = grouped[name]?.length || 0
            const covered = count > 0
            return {
              fillColor: covered ? '#0d9488' : 'transparent',
              fillOpacity: covered ? 0.12 : 0,
              color: covered ? '#0d948880' : '#d9770640',
              weight: covered ? 1.5 : 1,
              dashArray: covered ? undefined : '4 4',
            }
          },
          onEachFeature: (feature, layer) => {
            const name = feature.properties?.district || 'Unknown'
            const count = grouped[name]?.length || 0
            const topTypes = Object.entries(
              grouped[name]?.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc }, {} as Record<string, number>) || {}
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([t]) => t)

            const covered = count > 0
            const coveredDistricts = new Set(Object.keys(grouped).filter(d => grouped[d].length > 0))

            layer.on('mouseover', function (this: any) {
              this.setStyle({ weight: 2.5, fillOpacity: covered ? 0.25 : 0.08, color: covered ? '#0d9488' : '#d97706' })
              const centroid = this.getBounds().getCenter()
              onDistrictHover({ name, count, topTypes, covered, lat: centroid.lat, lng: centroid.lng })
            })
            layer.on('mouseout', function (this: any) {
              this.setStyle({
                fillColor: covered ? '#0d9488' : 'transparent',
                fillOpacity: covered ? 0.12 : 0,
                color: covered ? '#0d948880' : '#d9770640',
                weight: covered ? 1.5 : 1,
                dashArray: covered ? undefined : '4 4',
              })
              onDistrictHover(null)
            })
            layer.on('click', () => onDistrictClick(name))
          }
        }).addTo(map)
        layerRef.current = geoLayer

        // District centroid markers
        const markerGroup = L.layerGroup().addTo(map)
        markersRef.current = markerGroup

        geojson.features.forEach((feature: any) => {
          const name = feature.properties?.district
          const count = grouped[name]?.length || 0
          if (count === 0) return

          const layer = L.geoJSON(feature)
          const centroid = layer.getBounds().getCenter()
          const color = getColor(count, maxCount)
          const radius = getRadius(count, maxCount)

          const marker = L.circleMarker(centroid, {
            radius,
            fillColor: color,
            fillOpacity: 0.85,
            color: '#fff',
            weight: 1.5,
            opacity: 0.9,
          })

          marker.bindTooltip(
            `<div style="font-weight:600;font-size:13px;margin-bottom:2px">${name}</div>
             <div style="font-size:11px;opacity:0.8">${count} event${count !== 1 ? 's' : ''}</div>`,
            { direction: 'top', offset: [0, -radius], className: 'district-marker-tooltip' }
          )

          marker.on('click', () => onDistrictClick(name))
          marker.addTo(markerGroup)
        })
      })
      .catch(() => {})

    return () => {
      cancelled = true
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
      if (markersRef.current) {
        map.removeLayer(markersRef.current)
        markersRef.current = null
      }
    }
  }, [map, districtData, onDistrictHover, onDistrictClick])

  return null
}
