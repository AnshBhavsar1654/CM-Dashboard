//  Renders a stacked bar chart (by district) summarizing counts of events by category.

"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import type { EventData } from "@/lib/types"

// Dynamically import Recharts to ensure it's only used on the client.
// Recharts relies on browser APIs, so SSR is disabled for this component.
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
    Cell
  } = m;
  return {
    /**
     * Client-only Recharts bar chart.
     * onBarClick: Invoked with the bar datum (district) when a bar is clicked
     * showGrid: Toggles CartesianGrid visibility
     * animationDuration: Milliseconds for bar entrance animation
     * selectedDistrict: Name of the currently highlighted district
     */
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
        <BarChart 
          data={data} 
          margin={{ top: 5, right: 30, left: 20, bottom: 75 }}
        >
          {/* Using standard SVG defs element for filter definition */}
          <defs>
            <filter id="selectedShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
              <feFlood floodColor="hsl(var(--primary))" floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feComposite in="shadow" in2="SourceGraphic" operator="over" result="final" />
            </filter>
          </defs>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={50} 
            interval={0} 
            tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} 
          />
          <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
          {(() => {
            const TooltipContent = ({ active, payload, label }: any) => {
              // Custom tooltip showing total events and per-type breakdown for a district
              if (active && payload && payload.length) {
                const row = payload[0]?.payload || {};
                return (
                  <div className="p-3 bg-gradient-to-br from-background to-secondary/20 border border-border/50 rounded-lg shadow-lg min-w-[150px] backdrop-blur-sm">
                    <p className="font-bold text-foreground text-lg mb-2">{label}</p>
                    <p className="text-sm font-semibold text-primary">
                      Total Events: <span className="font-bold">{row.value}</span>
                    </p>
                    {row.types && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Breakdown by type:</p>
                        <ul className="text-xs list-disc list-inside">
                          {Object.entries(row.types).map(([t, c]: any) => (
                            <li key={String(t)} className="text-foreground"><span className="font-medium">{String(t)}:</span> {String(c)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {onBarClick && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {row.isSelected ? 'Currently selected - Click to clear filter' : 'Click to filter by district'}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            };
            // Keep the default translucent cursor highlight for hovered bars
            return <Tooltip content={<TooltipContent />} cursor={{ fill: 'hsl(var(--accent) / 0.1)' }} />;
          })()}
          {/*
            Stacked bars by event categories.
            - Each <Bar> shares the same stackId to accumulate totals per district.
            - Cell uses filter to emphasize the currently selected district via SVG shadow.
            - Opacity dims non-selected districts when a selection exists.
          */}
          {/* Government Events Bar */}
          <Bar
            dataKey="government"
            name="Government Events"
            fill="hsl(220, 70%, 60%)"
            stackId="a"
            barSize={30}
            animationDuration={animationDuration}
            animationBegin={0}
            radius={[4, 4, 0, 0]}
            style={{
              cursor: onBarClick ? 'pointer' : 'default',
              transition: 'all 0.3s ease-in-out'
            }}
            onClick={onBarClick}
            onMouseEnter={(e) => {
              if (e && e.target) {
                (e.target as any).style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (e && e.target) {
                (e.target as any).style.transform = 'scale(1)';
              }
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-government-${index}`}
                fill={'hsl(220, 70%, 60%)'}
                filter={entry.isSelected ? 'url(#selectedShadow)' : 'none'}
                opacity={selectedDistrict && !entry.isSelected ? 0.3 : 1}
                style={{ transition: 'all 0.3s ease-in-out' }}
              />
            ))}
          </Bar>
          {/* Public Events Bar */}
          <Bar
            dataKey="public"
            name="Public Events"
            fill="hsl(200, 65%, 65%)"
            stackId="a"
            barSize={30}
            animationDuration={animationDuration}
            animationBegin={100}
            radius={[4, 4, 0, 0]}
            style={{
              cursor: onBarClick ? 'pointer' : 'default',
              transition: 'all 0.3s ease-in-out'
            }}
            onClick={onBarClick}
            onMouseEnter={(e) => {
              if (e && e.target) {
                (e.target as any).style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (e && e.target) {
                (e.target as any).style.transform = 'scale(1)';
              }
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-public-${index}`}
                fill={'hsl(200, 65%, 65%)'}
                filter={entry.isSelected ? 'url(#selectedShadow)' : 'none'}
                opacity={selectedDistrict && !entry.isSelected ? 0.3 : 1}
                style={{ transition: 'all 0.3s ease-in-out' }}
              />
            ))}
          </Bar>
          {/* Social Events Bar */}
          <Bar
            dataKey="social"
            name="Social Events"
            fill="hsl(180, 60%, 55%)"
            stackId="a"
            barSize={30}
            animationDuration={animationDuration}
            animationBegin={200}
            radius={[4, 4, 0, 0]}
            style={{
              cursor: onBarClick ? 'pointer' : 'default',
              transition: 'all 0.3s ease-in-out'
            }}
            onClick={onBarClick}
            onMouseEnter={(e) => {
              if (e && e.target) {
                (e.target as any).style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (e && e.target) {
                (e.target as any).style.transform = 'scale(1)';
              }
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-social-${index}`}
                fill={'hsl(180, 60%, 55%)'}
                filter={entry.isSelected ? 'url(#selectedShadow)' : 'none'}
                opacity={selectedDistrict && !entry.isSelected ? 0.3 : 1}
                style={{ transition: 'all 0.3s ease-in-out' }}
              />
            ))}
          </Bar>
          {/* Political Events Bar */}
          <Bar
            dataKey="political"
            name="Political Events"
            fill="hsl(160, 55%, 50%)"
            stackId="a"
            barSize={30}
            animationDuration={animationDuration}
            animationBegin={300}
            radius={[4, 4, 0, 0]}
            style={{
              cursor: onBarClick ? 'pointer' : 'default',
              transition: 'all 0.3s ease-in-out'
            }}
            onClick={onBarClick}
            onMouseEnter={(e) => {
              if (e && e.target) {
                (e.target as any).style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (e && e.target) {
                (e.target as any).style.transform = 'scale(1)';
              }
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-political-${index}`}
                fill={'hsl(160, 55%, 50%)'}
                filter={entry.isSelected ? 'url(#selectedShadow)' : 'none'}
                opacity={selectedDistrict && !entry.isSelected ? 0.3 : 1}
                style={{ transition: 'all 0.3s ease-in-out' }}
              />
            ))}
          </Bar>
          {/* Other Events Bar */}
          <Bar
            dataKey="other"
            name="Other Events"
            fill="hsl(140, 50%, 60%)"
            stackId="a"
            barSize={30}
            animationDuration={animationDuration}
            animationBegin={400}
            radius={[4, 4, 0, 0]}
            style={{
              cursor: onBarClick ? 'pointer' : 'default',
              transition: 'all 0.3s ease-in-out'
            }}
            onClick={onBarClick}
            onMouseEnter={(e) => {
              if (e && e.target) {
                (e.target as any).style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (e && e.target) {
                (e.target as any).style.transform = 'scale(1)';
              }
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-other-${index}`}
                fill={'hsl(140, 50%, 60%)'}
                filter={entry.isSelected ? 'url(#selectedShadow)' : 'none'}
                opacity={selectedDistrict && !entry.isSelected ? 0.3 : 1}
                style={{ transition: 'all 0.3s ease-in-out' }}
              />
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
  /** Toggle grid lines on the chart area */
  const [showGrid, setShowGrid] = React.useState(true);
  const chartRef = React.useRef<HTMLDivElement>(null);

  const chartData = React.useMemo(() => {
    // Always show all districts from the original data, not filtered data
    const allEvents = data; // This will be the original unfiltered data
    
    // Get all unique districts from the original data
    const allDistricts = new Set(allEvents.map(event => event.district));
    
    // Define event type categories for consistent coloring
    const eventTypeCategories = {
      "government event": "government",
      "public event": "public",
      "social event": "social",
      "cultural & religious event": "social",
      "political event": "political"
    };
    
    // Calculate data for each district
    const districtData = Array.from(allDistricts).map(districtName => {
      const eventsInDistrict = allEvents.filter(event => event.district === districtName);
      const total = eventsInDistrict.length;
      
      // Categorize events by type
      const categorizedEvents = eventsInDistrict.reduce((acc, event) => {
        const category = eventTypeCategories[event.type.toLowerCase() as keyof typeof eventTypeCategories] || "other";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Also keep original types for tooltip
      const types = eventsInDistrict.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        name: districtName,
        value: total,
        ...categorizedEvents,
        types, // Keep original types for tooltip
        isSelected: selectedDistrict === districtName
      };
    });
    
    return districtData.sort((a, b) => b.value - a.value); // Sort descending
  }, [data, selectedDistrict]);

  /**
   * Handle clicks on any stacked bar segment.
   * If the clicked district is already selected, clear the filter; otherwise select it.
   */
  const handleBarClick = React.useCallback((barData: any) => {
    if (onDistrictSelect) {
      // Toggle district selection: if already selected, clear it; otherwise select it
      const newDistrict = selectedDistrict === barData.name ? undefined : barData.name;
      onDistrictSelect(newDistrict);
    }
  }, [onDistrictSelect, selectedDistrict]);

  if (chartData.length === 0) {
    return null; 
  }

  return (
    <Card className="bg-gradient-to-br from-card/50 via-card/30 to-accent/5 border border-accent/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">District-wise Events</CardTitle>
            <CardDescription>
              {selectedDistrict 
                ? `Showing all districts with ${selectedDistrict} highlighted. Click on bars to filter by district.`
                : 'Number of events held in each district. Click on bars to filter by district.'
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {selectedDistrict && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDistrictSelect?.(undefined)}
                className="flex items-center gap-1 border-accent/20 hover:border-accent/40"
              >
                Clear Filter
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className="flex items-center gap-1 border-secondary/20 hover:border-secondary/40"
            >
              {showGrid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Grid
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent ref={chartRef} className="border border-border/30 rounded-lg bg-gradient-to-br from-background/20 to-background/10 backdrop-blur-sm p-2">
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