"use client";

import * as React from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  X,
  FileDown,
  Check,
  Loader2,
  MapPin,
  Calendar,
  Building2,
  Tag,
  FileText,
  Navigation,
  Globe,
  ExternalLink,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { EventData } from "@/lib/types";
import { formatDisplayDate } from "@/lib/date";
import { CHART_COLORS, eventTypeToCategory } from "@/components/distribution/chart-colors";

type SortKey = "eventName" | "date" | "eventDateMs" | "district" | "type" | "department";

interface FilterState {
  search: string;
  districts: string[];
  types: string[];
  departments: string[];
}

function getUniqueValues(data: EventData[], key: keyof EventData): string[] {
  const set = new Set<string>();
  for (const event of data) {
    const val = event[key];
    if (typeof val === "string" && val) set.add(val);
  }
  return Array.from(set).sort();
}

function applyFilters(data: EventData[], filters: FilterState): EventData[] {
  return data.filter((event) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = `${event.eventName} ${event.location} ${event.district}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.districts.length > 0 && !filters.districts.includes(event.district)) return false;
    if (filters.types.length > 0 && !filters.types.includes(event.type)) return false;
    if (filters.departments.length > 0 && !filters.departments.includes(event.department)) return false;
    return true;
  });
}

function applySorting(
  data: EventData[],
  sortConfig: { key: SortKey; direction: "ascending" | "descending" } | null
): EventData[] {
  if (!sortConfig) return data;
  const sorted = [...data];
  sorted.sort((a, b) => {
    let aValue: string | number = a[sortConfig.key] as string | number;
    let bValue: string | number = b[sortConfig.key] as string | number;
    if (sortConfig.key === "date") {
      aValue = a.eventDateMs;
      bValue = b.eventDateMs;
    }
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortConfig.direction === "ascending" ? 1 : -1;
    if (bValue == null) return sortConfig.direction === "ascending" ? -1 : 1;
    if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });
  return sorted;
}

const TYPE_COLORS: Record<string, string> = {};
function getTypeColor(type: string): string {
  if (TYPE_COLORS[type]) return TYPE_COLORS[type];
  const category = eventTypeToCategory(type);
  TYPE_COLORS[type] = CHART_COLORS[category];
  return TYPE_COLORS[type];
}

function FilterChip({
  label,
  active,
  onClick,
  onRemove,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  onRemove?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium
        transition-all duration-150
        ${
          active
            ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 scale-[1.02]"
            : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-[1.02]"
        }
      `}
    >
      {label}
      {active && onRemove && (
        <X className="h-3 w-3" onClick={(e) => { e.stopPropagation(); onRemove(); }} />
      )}
    </button>
  );
}

const CHIP_LIMIT = 10;

function ChipRow({
  label,
  values,
  selected,
  onToggle,
}: {
  label: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  // Always keep selected chips visible even when the row is collapsed
  const visible = expanded
    ? values
    : [...values.slice(0, CHIP_LIMIT), ...selected.filter((v) => values.indexOf(v) >= CHIP_LIMIT)];
  const hidden = values.length - visible.length;

  return (
    <div className="flex items-start gap-2">
      <span className="text-xs font-medium text-muted-foreground w-20 shrink-0 pt-1.5">{label}</span>
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        {visible.map((v) => (
          <FilterChip
            key={v}
            label={v}
            active={selected.includes(v)}
            onClick={() => onToggle(v)}
            onRemove={selected.includes(v) ? () => onToggle(v) : undefined}
          />
        ))}
        {values.length > CHIP_LIMIT && (expanded || hidden > 0) && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-xs font-medium text-primary hover:underline px-1"
          >
            {expanded ? "Show less" : `+${hidden} more`}
          </button>
        )}
      </div>
    </div>
  );
}

function EventDetailDrawer({
  event,
  open,
  onClose,
}: {
  event: EventData | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!event) return null;
  const typeColor = getTypeColor(event.type);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="font-headline text-lg leading-tight pr-6">
            {event.eventName}
          </SheetTitle>
          <SheetDescription>{event.type}</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Date</span>
            <span className="ml-auto font-medium">{formatDisplayDate(event.date, "dd MMMM yyyy")}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Type</span>
            <span className="ml-auto">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: `color-mix(in srgb, ${typeColor} 12%, transparent)`,
                  color: typeColor,
                }}
              >
                {event.type}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">District</span>
            <span className="ml-auto font-medium">{event.district}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Location</span>
            <span className="ml-auto font-medium text-right max-w-[200px]">{event.location}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Department</span>
            <span className="ml-auto font-medium text-right max-w-[200px]">{event.department}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Navigation className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Distance</span>
            <span className="ml-auto font-medium">{event.distanceTravelled.toFixed(1)} km</span>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex items-start gap-3 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-muted-foreground mt-0.5">Tags</span>
              <div className="ml-auto flex flex-wrap gap-1 justify-end max-w-[200px]">
                {event.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.latitude !== 0 && event.longitude !== 0 && (
            <div className="pt-3 border-t">
              <a
                href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                View on Google Maps
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {event.imgLink && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Event Photo</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary remote hosts, routed through our proxy */}
              <img
                src={`/api/image-proxy?url=${encodeURIComponent(event.imgLink)}`}
                loading="lazy"
                alt={event.eventName}
                className="rounded-lg w-full max-h-64 object-cover"
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function EventsTable({ data, initialDistrict }: { data: EventData[]; initialDistrict?: string }) {
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    districts: initialDistrict ? [initialDistrict] : [],
    types: [],
    departments: [],
  });

  const [sortConfig, setSortConfig] = React.useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  }>({
    key: "eventDateMs",
    direction: "descending",
  });

  const [currentPage, setCurrentPage] = React.useState(1);
  const [exportState, setExportState] = React.useState<"idle" | "loading" | "success">("idle");
  const [selectedEvent, setSelectedEvent] = React.useState<EventData | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const eventsPerPage = 10;

  const districts = React.useMemo(() => getUniqueValues(data, "district"), [data]);
  const types = React.useMemo(() => getUniqueValues(data, "type"), [data]);
  const departments = React.useMemo(() => getUniqueValues(data, "department"), [data]);

  const filteredData = React.useMemo(() => applyFilters(data, filters), [data, filters]);
  const sortedData = React.useMemo(() => applySorting(filteredData, sortConfig), [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const currentEvents = sortedData.slice(startIndex, startIndex + eventsPerPage);

  const activeFilterCount =
    filters.districts.length + filters.types.length + filters.departments.length;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const toggleFilter = (category: "districts" | "types" | "departments", value: string) => {
    setFilters((prev) => {
      const arr = prev[category];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [category]: next };
    });
  };

  const clearAllFilters = () => {
    setFilters({ search: "", districts: [], types: [], departments: [] });
  };

  const requestSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "ascending" ? "descending" : "ascending" };
      }
      return { key, direction: "ascending" };
    });
  };

  const exportToCSV = async () => {
    setExportState("loading");
    const headers = ["Event Name", "Date", "Type", "District", "Location", "Latitude", "Longitude", "Department", "Distance (km)"];
    const csvRows = [
      headers.join(","),
      ...sortedData.map((event) =>
        [
          `"${event.eventName.replace(/"/g, '""')}"`,
          `"${new Date(event.date).toISOString().slice(0, 10)}"`,
          `"${event.type.replace(/"/g, '""')}"`,
          `"${event.district.replace(/"/g, '""')}"`,
          `"${event.location.replace(/"/g, '""')}"`,
          event.latitude,
          event.longitude,
          `"${event.department.replace(/"/g, '""')}"`,
          event.distanceTravelled.toFixed(2),
        ].join(",")
      ),
    ];
    // BOM so Excel opens UTF-8 (e.g. Gujarati text) correctly
    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `events-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportState("success");
    setTimeout(() => setExportState("idle"), 2000);
  };

  const openDrawer = (event: EventData) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  };

  const sortLabel = sortConfig
    ? `${sortConfig.key === "eventDateMs" ? "Date" : sortConfig.key === "eventName" ? "Event Name" : sortConfig.key.charAt(0).toUpperCase() + sortConfig.key.slice(1)} ${sortConfig.direction === "ascending" ? "↑" : "↓"}`
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            A comprehensive list of all recorded outreach events.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          disabled={exportState === "loading"}
          className="shrink-0"
        >
          {exportState === "loading" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : exportState === "success" ? (
            <Check className="mr-2 h-4 w-4 text-emerald-600" />
          ) : (
            <FileDown className="mr-2 h-4 w-4" />
          )}
          {exportState === "success" ? "Exported" : "Export CSV"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search + filter bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by event, venue or district..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-9"
            />
          </div>

          {/* Filter chips */}
          <div className="space-y-2">
            <ChipRow label="District" values={districts} selected={filters.districts} onToggle={(v) => toggleFilter("districts", v)} />
            <ChipRow label="Type" values={types} selected={filters.types} onToggle={(v) => toggleFilter("types", v)} />
            <ChipRow label="Department" values={departments} selected={filters.departments} onToggle={(v) => toggleFilter("departments", v)} />
          </div>

          {/* Active state bar */}
          {(activeFilterCount > 0 || sortLabel) && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {sortLabel && (
                  <span>
                    Sorted by <span className="font-medium text-foreground">{sortLabel}</span>
                  </span>
                )}
                {activeFilterCount > 0 && (
                  <span>
                    <span className="font-medium text-foreground">{activeFilterCount}</span> filter{activeFilterCount !== 1 && "s"} active
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="text-primary hover:underline">
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {(
                  [
                    { key: "eventName", label: "Event Name", centered: false },
                    { key: "date", label: "Date", centered: false },
                    { key: "district", label: "District", centered: true },
                    { key: "type", label: "Type", centered: true },
                    { key: "department", label: "Department", centered: true },
                  ] as const
                ).map(({ key, label, centered }) => (
                  <TableHead key={key} className={centered ? "text-center" : ""}>
                    <button
                      onClick={() => requestSort(key)}
                      className={`
                        inline-flex items-center gap-1 h-8 px-2 -ml-2 rounded-md text-sm font-medium
                        transition-all duration-150
                        hover:bg-muted/80 hover:scale-[1.02]
                        ${sortConfig?.key === key ? "text-foreground bg-muted/50" : "text-muted-foreground"}
                      `}
                    >
                      {label}
                      {sortConfig?.key === key ? (
                        sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEvents.length > 0 ? (
                currentEvents.map((event) => {
                  const typeColor = getTypeColor(event.type);
                  return (
                    <TableRow
                      key={event.id}
                      className="cursor-pointer hover:bg-muted/50 transition-all duration-150 hover:border-l-2 hover:border-l-primary"
                      onClick={() => openDrawer(event)}
                    >
                      <TableCell className="font-medium">{event.eventName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDisplayDate(event.date)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{event.district}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold"
                          style={{
                            borderColor: `color-mix(in srgb, ${typeColor} 30%, transparent)`,
                            backgroundColor: `color-mix(in srgb, ${typeColor} 10%, transparent)`,
                            color: typeColor,
                          }}
                        >
                          {event.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {event.department}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {activeFilterCount > 0 || filters.search
                      ? "No events match your filters."
                      : "No events found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {sortedData.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}–{Math.min(startIndex + eventsPerPage, sortedData.length)} of{" "}
                {sortedData.length} events
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8 text-xs"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <EventDetailDrawer
        event={selectedEvent}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Card>
  );
}
