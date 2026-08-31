import { getEventsData } from "@/lib/events-data"
import { OverviewWrapper } from "@/components/dashboard/overview-wrapper"

export default async function OverviewPage() {
  const events = await getEventsData()

  return <OverviewWrapper events={events} />
}
