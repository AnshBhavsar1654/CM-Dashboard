"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import type { EventData } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const TOTAL_DISTRICTS = 33

const GUJARAT_DISTRICTS = [
  "Ahmedabad", "Gandhinagar", "Mahesana", "Banaskantha", "Sabarkantha",
  "Aravalli", "Patan", "Rajkot", "Surat", "Vadodara", "Anand", "Amreli",
  "Kheda", "Kutch", "Bhavnagar", "Dahod", "Panchmahal", "Porbandar",
  "Gir Somnath", "Mahisagar", "Narmada", "Bharuch", "Jamnagar", "Navsari",
  "Valsad", "Junagadh", "Surendranagar", "Tapi", "Dang", "Devbhoomi Dwarka",
  "Morbi", "Botad", "Chhota Udepur",
]

const GEOJSON_URL = "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/states/gujarat.geojson"

const GujaratMap = dynamic(async () => {
  const L = await import("leaflet")
  const { MapContainer, GeoJSON, useMap } = await import("react-leaflet")

  function FitBounds({ geojson }: { geojson: any }) {
    const map = useMap()
    React.useEffect(() => {
      if (geojson) {
        const layer = L.geoJSON(geojson)
        map.fitBounds(layer.getBounds(), { padding: [20, 20] })
      }
    }, [geojson, map])
    return null
  }

  return {
    default: function GujaratMapInner({
      geojson,
      coveredSet,
    }: {
      geojson: any
      coveredSet: Set<string>
    }) {
      if (!geojson) return null

      return (
        <MapContainer
          center={[22.5, 72.0]}
          zoom={7}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          className="w-full h-full rounded-lg"
          style={{ background: "hsl(var(--muted) / 0.2)" }}
        >
          <FitBounds geojson={geojson} />
          <GeoJSON
            key={JSON.stringify([...coveredSet])}
            data={geojson}
            style={(feature) => {
              const name = feature?.properties?.district
              const isCovered = coveredSet.has(name)
              return {
                fillColor: isCovered ? "#0d9488" : "#d97706",
                fillOpacity: isCovered ? 0.6 : 0.35,
                color: isCovered ? "#0d9488" : "#d97706",
                weight: 1.5,
                opacity: 0.8,
              }
            }}
            onEachFeature={(feature, layer) => {
              const name = feature.properties?.district || "Unknown"
              const isCovered = coveredSet.has(name)
              layer.bindTooltip(
                `<div style="font-size:12px;font-weight:500">${name}</div>
                 <div style="font-size:10px;color:${isCovered ? "#0d9488" : "#d97706"}">
                   ${isCovered ? "Visited" : "Not visited"}
                 </div>`,
                { sticky: true, className: "district-tooltip" }
              )
              layer.on("mouseover", function (this: any) {
                this.setStyle({ weight: 3, fillOpacity: 0.85 })
              })
              layer.on("mouseout", function (this: any) {
                this.setStyle({ weight: 1.5, fillOpacity: isCovered ? 0.6 : 0.35 })
              })
            }}
          />
        </MapContainer>
      )
    },
  }
}, { ssr: false })

function DonutRing({ covered, total }: { covered: number; total: number }) {
  const pct = total > 0 ? covered / total : 0
  const r = 32
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - pct)
  const size = 80

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="hsl(var(--palette-covered))" strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-headline font-semibold text-foreground tabular-nums">{covered}</span>
        <span className="text-[9px] text-muted-foreground">of {total}</span>
      </div>
    </div>
  )
}

interface DistrictCoverageRingProps {
  events: EventData[]
}

export function DistrictCoverageRing({ events }: DistrictCoverageRingProps) {
  const [geojson, setGeojson] = React.useState<any>(null)

  const { covered, notCovered, coveredSet } = React.useMemo(() => {
    const coveredSet = new Set(
      events.filter(e => e.district && e.district !== "Out of State").map(e => e.district)
    )
    return {
      covered: coveredSet.size,
      notCovered: GUJARAT_DISTRICTS.filter(d => !coveredSet.has(d)),
      coveredSet,
    }
  }, [events])

  React.useEffect(() => {
    fetch(GEOJSON_URL)
      .then(r => r.json())
      .then(setGeojson)
      .catch(() => {})
  }, [])

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          District Coverage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <DonutRing covered={covered} total={TOTAL_DISTRICTS} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Not yet visited
              </p>
              {notCovered.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {notCovered.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center rounded-md bg-palette-attention/10 px-2 py-0.5 text-xs font-medium text-palette-attention"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-palette-covered font-medium">All 33 districts covered!</p>
              )}
            </div>
          </div>
          <div className="h-[300px] rounded-lg overflow-hidden border">
            {geojson ? (
              <GujaratMap geojson={geojson} coveredSet={coveredSet} />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted/20 text-xs text-muted-foreground">
                Loading map...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
