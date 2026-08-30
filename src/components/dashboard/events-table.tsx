"use client";

import * as React from "react";
import { ArrowUpDown, Download, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { EventData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDisplayDate } from "@/lib/date";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type SortKey = keyof EventData;

export function EventsTable({ data }: { data: EventData[] }) {
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({
    key: 'eventDateMs',
    direction: 'descending',
  });

  const [currentPage, setCurrentPage] = React.useState(1);
  const eventsPerPage = 10;

  const exportToCSV = () => {
    const headers = ["Event Name", "Date", "Type", "District", "Tags", "Department", "Distance (km)"];
    const csvRows = [
      headers.join(","),
      ...data.map(event => [
        `"${event.eventName.replace(/"/g, '""')}"`,
        `"${new Date(event.date).toISOString().slice(0, 10)}"`,
        `"${event.type}"`,
        `"${event.district}"`,
        `"${event.tags.join('; ').replace(/"/g, '""')}"`,
        `"${event.department}"`,
        event.distanceTravelled.toFixed(2)
      ].join(","))
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `events-export-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedData = React.useMemo(() => {
    const sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = sortedData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (key: SortKey, showDefaultIcon: boolean = true) => {
    if (!sortConfig || sortConfig.key !== key) {
      return showDefaultIcon ? <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" /> : null;
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const SortableHeader = ({
    sortKey,
    children,
    showDefaultIcon = true,
    isCentered = false,
  }: {
    sortKey: SortKey;
    children: React.ReactNode;
    showDefaultIcon?: boolean;
    isCentered?: boolean;
  }) => (
    <TableHead className={isCentered ? 'text-center' : ''}>
      <Button variant="ghost" size="sm" onClick={() => requestSort(sortKey)} className="h-8 px-2 -ml-2 font-medium text-muted-foreground">
        {children}
        <span className="ml-1">{getSortIcon(sortKey, showDefaultIcon)}</span>
      </Button>
    </TableHead>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            A comprehensive list of all outreach events within the selected date range.
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader sortKey="eventName">Event Name</SortableHeader>
                <SortableHeader sortKey="date" showDefaultIcon={false}>Date</SortableHeader>
                <SortableHeader sortKey="district" isCentered>District</SortableHeader>
                <SortableHeader sortKey="type" isCentered>Type</SortableHeader>
                <TableHead className="text-center">Tags</TableHead>
                <SortableHeader sortKey="department" isCentered>Department</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEvents.length > 0 ? (
                currentEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.eventName}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDisplayDate(event.date)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{event.district}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default">{event.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {event.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{event.department}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length} events
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages || 1}
              </span>
              <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
