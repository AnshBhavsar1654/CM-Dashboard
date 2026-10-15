import { getEventsData } from "@/lib/events-data"
import { EventsTable } from "@/components/events/events-table"

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string | string[] }>
}) {
  const [events, params] = await Promise.all([getEventsData(), searchParams])
  const district = typeof params.district === "string" ? params.district : undefined

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Events Table</h2>
        <p className="text-sm text-muted-foreground">Complete list of all outreach events with sorting and export.</p>
      </div>

      <EventsTable data={events} initialDistrict={district} />
    </div>
  )
}
