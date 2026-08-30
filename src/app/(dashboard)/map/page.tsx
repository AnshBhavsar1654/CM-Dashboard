import { getFilteredEventsData } from "@/lib/events-data"
import { MapView } from "@/components/dashboard/map-view"

export default async function MapPage() {
  const events = await getFilteredEventsData("2y")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Map View</h2>
        <p className="text-sm text-muted-foreground">Geographic visualization of all outreach events across Gujarat.</p>
      </div>

      <MapView data={events} />
    </div>
  )
}
