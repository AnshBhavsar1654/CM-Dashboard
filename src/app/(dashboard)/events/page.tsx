import { getFilteredEventsData } from "@/lib/events-data"
import { EventsTable } from "@/components/dashboard/events-table"

export default async function EventsPage() {
  const events = await getFilteredEventsData("2y")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Events Table</h2>
        <p className="text-sm text-muted-foreground">Complete list of all outreach events with sorting and export.</p>
      </div>

      <EventsTable data={events} />
    </div>
  )
}
