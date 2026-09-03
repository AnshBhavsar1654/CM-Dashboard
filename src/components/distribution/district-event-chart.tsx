"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, X } from "lucide-react"
import type { EventData } from "@/lib/types"
import { BAR_CATEGORIES, eventTypeToBarCategory } from "./chart-colors"

function BarSkeleton() {
  const widths = [88, 74, 62, 53, 45, 38, 30, 24, 18, 14];
  return (
    <div className="flex flex-col gap-3 py-4">
      {widths.map((w, i) => (
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
  );
}

function BarEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="flex items-end gap-1.5 h-16">
        {[40, 56, 48, 36, 28].map((h, i) => (
          <div
            key={i}
            className="w-5 rounded-t-sm"
            style={{
              height: h,
              border: "1.5px dashed hsl(var(--surface-elevation-2) / 0.4)",
              background: "transparent",
            }}
          />
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          No district data to display
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Try adjusting your filters
        </p>
      </div>
    </div>
  );
}

const RechartsBar = dynamic(async () => {
  const m = await import("recharts");
  const {
    ResponsiveContainer,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Bar,
    Cell,
  } = m;
  return {
    default: ({
      data,
      categories,
      onBarClick,
      showGrid = true,
      animationDuration = 1000,
      selectedDistrict,
    }: {
      data: any[];
      categories: typeof BAR_CATEGORIES;
      onBarClick?: (data: any) => void;
      showGrid?: boolean;
      animationDuration?: number;
      selectedDistrict?: string;
    }) => (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 75 }}
        >
          <defs>
            <filter
              id="selectedShadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation="3"
                result="blur"
              />
              <feFlood
                floodColor="hsl(var(--primary))"
                floodOpacity="0.35"
                result="color"
              />
              <feComposite
                in="color"
                in2="blur"
                operator="in"
                result="shadow"
              />
              <feOffset
                dx="0"
                dy="2"
                in="shadow"
                result="offsetShadow"
              />
              <feComposite
                in="offsetShadow"
                in2="SourceGraphic"
                operator="over"
              />
            </filter>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border) / 0.5)"
              vertical={false}
            />
          )}
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={50}
            interval={0}
            tick={{
              fontSize: 11,
              fill: "hsl(var(--muted-foreground))",
            }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tick={{
              fill: "hsl(var(--muted-foreground))",
              fontSize: 12,
            }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          {(() => {
            const TooltipContent = ({ active, payload, label }: any) => {
              if (active && payload && payload.length) {
                const row = payload[0]?.payload || {};
                return (
                  <div className="p-3 bg-background border rounded-lg shadow-md min-w-[150px]">
                    <p className="font-semibold text-foreground mb-1">
                      {label}
                    </p>
                    <p className="text-sm text-primary font-medium">
                      Total: {row.value}
                    </p>
                    {row.types && (
                      <div className="mt-1.5 pt-1.5 border-t">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Breakdown:
                        </p>
                        {Object.entries(row.types).map(([t, c]: any) => (
                          <p key={String(t)} className="text-xs">
                            {String(t)}: {String(c)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            };
            return (
              <Tooltip
                content={<TooltipContent />}
                cursor={{ fill: "hsl(var(--accent) / 0.08)" }}
              />
            );
          })()}
          {categories.map((cat) => (
            <Bar
              key={cat.key}
              dataKey={cat.key}
              name={cat.label}
              fill={cat.color}
              stackId="a"
              barSize={30}
              animationDuration={animationDuration}
              animationBegin={categories.indexOf(cat) * 100}
              radius={[4, 4, 0, 0]}
              style={{
                cursor: onBarClick ? "pointer" : "default",
                transition: "all 0.3s ease-in-out",
              }}
              onClick={onBarClick}
            >
              {data.map((entry, index) => {
                const isSelected = entry.isSelected;
                const isDimmed = selectedDistrict && !isSelected;
                return (
                  <Cell
                    key={`cell-${cat.key}-${index}`}
                    fill={cat.color}
                    stroke={
                      isSelected ? "hsl(var(--primary))" : "none"
                    }
                    strokeWidth={isSelected ? 2 : 0}
                    filter={isSelected ? "url(#selectedShadow)" : "none"}
                    opacity={isDimmed ? 0.25 : 1}
                    style={{ transition: "all 0.3s ease-in-out" }}
                  />
                );
              })}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    ),
  };
}, { ssr: false });

export function DistrictEventChart({
  data,
  onDistrictSelect,
  selectedDistrict,
  loading,
}: {
  data: EventData[];
  onDistrictSelect?: (district: string | undefined) => void;
  selectedDistrict?: string;
  loading?: boolean;
}) {
  const [showGrid, setShowGrid] = React.useState(true);

  const chartData = React.useMemo(() => {
    const allEvents = data;
    const allDistricts = new Set(allEvents.map((event) => event.district));
    const districtData = Array.from(allDistricts).map((districtName) => {
      const eventsInDistrict = allEvents.filter(
        (event) => event.district === districtName
      );
      const total = eventsInDistrict.length;
      const categorizedEvents = eventsInDistrict.reduce(
        (acc, event) => {
          const category = eventTypeToBarCategory(event.type);
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      const types = eventsInDistrict.reduce(
        (acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      return {
        name: districtName,
        value: total,
        ...categorizedEvents,
        types,
        isSelected: selectedDistrict === districtName,
      };
    });
    return districtData.sort((a, b) => b.value - a.value);
  }, [data, selectedDistrict]);

  const handleBarClick = React.useCallback(
    (barData: any) => {
      if (onDistrictSelect) {
        const newDistrict =
          selectedDistrict === barData.name ? undefined : barData.name;
        onDistrictSelect(newDistrict);
      }
    },
    [onDistrictSelect, selectedDistrict]
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>District-wise Events</CardTitle>
              <CardDescription>Loading district data…</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BarSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>District-wise Events</CardTitle>
          <CardDescription>
            Events by district. Click bars to filter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarEmpty />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>District-wise Events</CardTitle>
            <CardDescription>
              {selectedDistrict
                ? `Showing all districts with ${selectedDistrict} highlighted.`
                : "Events by district. Click bars to filter."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {selectedDistrict && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onDistrictSelect?.(undefined)}
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                {selectedDistrict}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
            >
              {showGrid ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <RechartsBar
          data={chartData}
          categories={BAR_CATEGORIES}
          onBarClick={handleBarClick}
          showGrid={showGrid}
          animationDuration={1200}
          selectedDistrict={selectedDistrict}
        />
      </CardContent>
    </Card>
  );
}
