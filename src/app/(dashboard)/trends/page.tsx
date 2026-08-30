import { getFilteredEventsData } from "@/lib/events-data"
import { MonthlyEventChart } from "@/components/dashboard/monthly-event-chart"

export default async function TrendsPage() {
  const events = await getFilteredEventsData("2y")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Monthly Trends</h2>
        <p className="text-sm text-muted-foreground">Event frequency trends over the last 12 months.</p>
      </div>

      <MonthlyEventChart data={events} />
    </div>
  )
}
