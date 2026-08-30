import { getFilteredEventsData } from "@/lib/events-data"
import { EventTypeChart } from "@/components/dashboard/event-type-chart"
import { DistrictEventChart } from "@/components/dashboard/district-event-chart"

export default async function DistributionPage() {
  const events = await getFilteredEventsData("2y")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Event Distribution</h2>
        <p className="text-sm text-muted-foreground">Breakdown of events by type and district.</p>
      </div>

      <div className="space-y-6">
        <EventTypeChart data={events} />
        <DistrictEventChart data={events} />
      </div>
    </div>
  )
}
