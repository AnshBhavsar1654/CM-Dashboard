import { getFilteredEventsData } from "@/lib/events-data"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { ImageCarousel } from "@/components/dashboard/image-carousel"

export default async function OverviewPage() {
  const events = await getFilteredEventsData("2y")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground">Key metrics and highlights from CM outreach activities.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <StatsGrid data={events} />
        </div>
        <div className="lg:col-span-2">
          <ImageCarousel events={events} />
        </div>
      </div>
    </div>
  )
}
