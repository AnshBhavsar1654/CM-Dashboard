import { Suspense } from "react"
import { getFilteredEventsData } from "@/lib/events-data"
import { EventTypeChart } from "@/components/distribution/event-type-chart"
import { DistrictEventChart } from "@/components/distribution/district-event-chart"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

function ChartSkeleton() {
  const barWidths = [88, 74, 62, 53, 45, 38, 30, 24, 18, 14];
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div
          className="h-5 w-48 rounded animate-pulse"
          style={{ background: "hsl(var(--surface-elevation-1) / 0.4)" }}
        />
        <div
          className="h-3 w-72 rounded mt-2 animate-pulse"
          style={{ background: "hsl(var(--surface-elevation-1) / 0.3)" }}
        />
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-col gap-3 py-4">
          {barWidths.map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="h-3 w-16 rounded animate-pulse"
                style={{
                  background: "hsl(var(--surface-elevation-1) / 0.35)",
                  animationDelay: `${i * 80}ms`,
                }}
              />
              <div className="flex-1 flex gap-px">
                {[0.35, 0.28, 0.2, 0.12, 0.05].map((frac, j) => (
                  <div
                    key={j}
                    className="h-7 rounded-sm animate-pulse"
                    style={{
                      width: `${w * frac}%`,
                      background: `hsl(var(--surface-elevation-${(j % 2) + 1}) / ${0.2 + j * 0.04})`,
                      animationDelay: `${i * 80 + j * 40}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function EventCharts() {
  const events = await getFilteredEventsData("2y");
  return (
    <>
      <EventTypeChart data={events} />
      <DistrictEventChart data={events} />
    </>
  );
}

export default function DistributionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Event Distribution
        </h2>
        <p className="text-sm text-muted-foreground">
          Breakdown of events by type and district.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        }
      >
        <EventCharts />
      </Suspense>
    </div>
  );
}
