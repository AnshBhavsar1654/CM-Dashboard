"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import type { EventData } from "@/lib/types"

const RechartsBar = dynamic(async () => {
  const m = await import("recharts");
  const { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } = m;
  return {
    default: ({
      data,
      onBarClick,
      showGrid = true,
      animationDuration = 1000,
      selectedDistrict
    }: {
      data: any[];
      onBarClick?: (data: any) => void;
      showGrid?: boolean;
      animationDuration?: number;
      selectedDistrict?: string;
    }) => (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 75 }}>
          <defs>
            <filter id="selectedShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
              <feFlood floodColor="hsl(var(--primary))" floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feComposite in="shadow" in2="SourceGraphic" operator="over" result="final" />
            </filter>
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={50}
            interval={0}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          {(() => {
            const TooltipContent = ({ active, payload, label }: any) => {
              if (active && payload && payload.length) {
                const row = payload[0]?.payload || {};
                return (
                  <div className="p-3 bg-background border rounded-lg shadow-md min-w-[150px]">
                    <p className="font-semibold text-foreground mb-1">{label}</p>
                    <p className="text-sm text-primary font-medium">Total: {row.value}</p>
                    {row.types && (
                      <div className="mt-1.5 pt-1.5 border-t">
                        <p className="text-xs text-muted-foreground mb-0.5">Breakdown:</p>
                        {Object.entries(row.types).map(([t, c]: any) => (
                          <p key={String(t)} className="text-xs">{String(t)}: {String(c)}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            };
            return <Tooltip content={<TooltipContent />} cursor={{ fill: 'hsl(var(--accent) / 0.1)' }} />;
          })()}
          <Bar dataKey="government" name="Government" fill="hsl(220, 70%, 60%)" stackId="a" barSize={30} animationDuration={animationDuration} animationBegin={0} radius={[4, 4, 0, 0]} style={{ cursor: onBarClick ? 'pointer' : 'default', transition: 'all 0.3s ease-in-out' }} onClick={onBarClick}>
            {data.map((entry, index) => (
              <Cell key={`cell-government-${index}`} fill="hsl(220, 70%, 60%)" filter={entry.isSelected ? 'url(#selectedShadow)' : 'none'} opacity={selectedDistrict && !entry.isSelected ? 0.3 : 1} style={{ transition: 'all 0.3s ease-in-out' }} />
            ))}
          </Bar>
          <Bar dataKey="public" name="Public" fill="hsl(200, 65%, 65%)" stackId="a" barSize={30} animationDuration={animationDuration} animationBegin={100} radius={[4, 4, 0, 0]} style={{ cursor: onBarClick ? 'pointer' : 'default', transition: 'all 0.3s ease-in-out' }} onClick={onBarClick}>
            {data.map((entry, index) => (
              <Cell key={`cell-public-${index}`} fill="hsl(200, 65%, 65%)" filter={entry.isSelected ? 'url(#selectedShadow)' : 'none'} opacity={selectedDistrict && !entry.isSelected ? 0.3 : 1} style={{ transition: 'all 0.3s ease-in-out' }} />
            ))}
          </Bar>
          <Bar dataKey="social" name="Social" fill="hsl(180, 60%, 55%)" stackId="a" barSize={30} animationDuration={animationDuration} animationBegin={200} radius={[4, 4, 0, 0]} style={{ cursor: onBarClick ? 'pointer' : 'default', transition: 'all 0.3s ease-in-out' }} onClick={onBarClick}>
            {data.map((entry, index) => (
              <Cell key={`cell-social-${index}`} fill="hsl(180, 60%, 55%)" filter={entry.isSelected ? 'url(#selectedShadow)' : 'none'} opacity={selectedDistrict && !entry.isSelected ? 0.3 : 1} style={{ transition: 'all 0.3s ease-in-out' }} />
            ))}
          </Bar>
          <Bar dataKey="political" name="Political" fill="hsl(160, 55%, 50%)" stackId="a" barSize={30} animationDuration={animationDuration} animationBegin={300} radius={[4, 4, 0, 0]} style={{ cursor: onBarClick ? 'pointer' : 'default', transition: 'all 0.3s ease-in-out' }} onClick={onBarClick}>
            {data.map((entry, index) => (
              <Cell key={`cell-political-${index}`} fill="hsl(160, 55%, 50%)" filter={entry.isSelected ? 'url(#selectedShadow)' : 'none'} opacity={selectedDistrict && !entry.isSelected ? 0.3 : 1} style={{ transition: 'all 0.3s ease-in-out' }} />
            ))}
          </Bar>
          <Bar dataKey="other" name="Other" fill="hsl(140, 50%, 60%)" stackId="a" barSize={30} animationDuration={animationDuration} animationBegin={400} radius={[4, 4, 0, 0]} style={{ cursor: onBarClick ? 'pointer' : 'default', transition: 'all 0.3s ease-in-out' }} onClick={onBarClick}>
            {data.map((entry, index) => (
              <Cell key={`cell-other-${index}`} fill="hsl(140, 50%, 60%)" filter={entry.isSelected ? 'url(#selectedShadow)' : 'none'} opacity={selectedDistrict && !entry.isSelected ? 0.3 : 1} style={{ transition: 'all 0.3s ease-in-out' }} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }
}, { ssr: false })

export function DistrictEventChart({
  data,
  onDistrictSelect,
  selectedDistrict
}: {
  data: EventData[];
  onDistrictSelect?: (district: string | undefined) => void;
  selectedDistrict?: string;
}) {
  const [showGrid, setShowGrid] = React.useState(true);

  const chartData = React.useMemo(() => {
    const allEvents = data;
    const allDistricts = new Set(allEvents.map(event => event.district));
    const eventTypeCategories = {
      "government event": "government",
      "public event": "public",
      "social event": "social",
      "cultural & religious event": "social",
      "political event": "political"
    };
    const districtData = Array.from(allDistricts).map(districtName => {
      const eventsInDistrict = allEvents.filter(event => event.district === districtName);
      const total = eventsInDistrict.length;
      const categorizedEvents = eventsInDistrict.reduce((acc, event) => {
        const category = eventTypeCategories[event.type.toLowerCase() as keyof typeof eventTypeCategories] || "other";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const types = eventsInDistrict.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return { name: districtName, value: total, ...categorizedEvents, types, isSelected: selectedDistrict === districtName };
    });
    return districtData.sort((a, b) => b.value - a.value);
  }, [data, selectedDistrict]);

  const handleBarClick = React.useCallback((barData: any) => {
    if (onDistrictSelect) {
      const newDistrict = selectedDistrict === barData.name ? undefined : barData.name;
      onDistrictSelect(newDistrict);
    }
  }, [onDistrictSelect, selectedDistrict]);

  if (chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>District-wise Events</CardTitle>
            <CardDescription>
              {selectedDistrict
                ? `Showing all districts with ${selectedDistrict} highlighted.`
                : 'Events by district. Click bars to filter.'
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {selectedDistrict && (
              <Button variant="outline" size="sm" onClick={() => onDistrictSelect?.(undefined)}>
                Clear Filter
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
              {showGrid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <RechartsBar
          data={chartData}
          onBarClick={handleBarClick}
          showGrid={showGrid}
          animationDuration={1200}
          selectedDistrict={selectedDistrict}
        />
      </CardContent>
    </Card>
  );
}
