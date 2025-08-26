// Displays a sortable, paginated, and exportable table of events

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

type SortKey = keyof EventData; // Possible keys for sorting based on EventData type

/**
 * Sortable columns
 * CSV export functionality
 * Pagination controls
 */
export function EventsTable({ data }: { data: EventData[] }) {
  // Sorting configuration (default: sort by date descending)
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({
    key: 'eventDateMs',
    direction: 'descending',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const eventsPerPage = 10; // Number of events to show per page

  /**
   * CSV Export Function
   * Converts the table data into CSV format and triggers a file download.
   */
  const exportToCSV = () => {
    // Define CSV headers
    const headers = ["Event Name", "Date", "Type", "District", "Tags", "Department", "Distance (km)"];

    // Build CSV rows
    const csvRows = [
      headers.join(","), // Header row
      ...data.map(event => [
        `"${event.eventName.replace(/"/g, '""')}"`, // Escape quotes in event name
        `"${new Date(event.date).toISOString().slice(0, 10)}"`, // Format date (YYYY-MM-DD)
        `"${event.type}"`,
        `"${event.district}"`,
        `"${event.tags.join('; ').replace(/"/g, '""')}"`, // Join tags with semicolon
        `"${event.department}"`,
        event.distanceTravelled.toFixed(2) // Format distance to 2 decimal places
      ].join(","))
    ];

    // Convert to string
    const csvContent = csvRows.join("\n");

    // Create and download CSV file
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

  /**
   * Sorting logic using useMemo
   * Ensures data is only re-sorted when sortConfig or data changes.
   */
  const sortedData = React.useMemo(() => {
    const sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'ascending' ? -1 : 1;

        // Compare values normally
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = sortedData.slice(startIndex, endIndex);

  // Change page (ensures it stays within valid bounds)
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle sorting when a column header is clicked
  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    // If already sorting by this key in ascending, switch to descending
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset pagination to page 1 when sorting changes
  };

  // Display appropriate sort icon for each column
  const getSortIcon = (key: SortKey, showDefaultIcon: boolean = true) => {
    if (!sortConfig || sortConfig.key !== key) {
      return showDefaultIcon ? <ArrowUpDown className="ml-2 h-4 w-4" /> : null;
    }
    return sortConfig.direction === 'ascending' ? '🔼' : '🔽';
  };

  /**
   * Reusable sortable header component
   * Wraps column headers with sort button + icon
   */
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
      <Button variant="ghost" onClick={() => requestSort(sortKey)} className="dark:hover:text-white">
        {children}
        <span className="ml-2">{getSortIcon(sortKey, showDefaultIcon)}</span>
      </Button>
    </TableHead>
  );

  return (
    <Card className="bg-gradient-to-br from-card/50 via-card/30 to-info/5 border border-info/20 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Header with Title + Export Button */}
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Event Details
          </CardTitle>
          <CardDescription>
            A comprehensive list of all outreach events within the selected date range.
          </CardDescription>
        </div>
        <div>
          {/* Export Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-info/20 hover:border-info/40 dark:hover:text-white">
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
        </div>
      </CardHeader>

      {/* Main Table */}
      <CardContent>
        <div className="rounded-lg border border-border/30 bg-gradient-to-br from-background/20 to-background/10 backdrop-blur-sm">
          <Table>
            {/* Table Headers (sortable) */}
            <TableHeader className="sticky top-0 bg-background/80 backdrop-blur-sm z-10">
              <TableRow className="border-border/30">
                <SortableHeader sortKey="eventName">Event Name</SortableHeader>
                <SortableHeader sortKey="date" showDefaultIcon={false}>Date</SortableHeader>
                <SortableHeader sortKey="district" isCentered>District</SortableHeader>
                <SortableHeader sortKey="type" isCentered>Type</SortableHeader>
                <TableHead className="text-center">Tags</TableHead>
                <SortableHeader sortKey="department" isCentered>Department</SortableHeader>
              </TableRow>
            </TableHeader>

            {/* Table Body (data rows) */}
            <TableBody>
              {currentEvents.length > 0 ? (
                currentEvents.map((event) => (
                  <TableRow key={event.id} className="border-border/30 hover:bg-accent/10 transition-colors duration-200">
                    <TableCell className="font-medium">{event.eventName}</TableCell>
                    <TableCell>{formatDisplayDate(event.date)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="border-primary/20">{event.district}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default" className="bg-gradient-to-r from-primary to-primary/80">{event.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {event.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-gradient-to-r from-secondary to-secondary/80">{tag}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{event.department}</TableCell>
                  </TableRow>
                ))
              ) : (
                // No results fallback
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length} events
            </div>
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Current Page Info */}
              <div className="flex items-center">
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages || 1}
                </span>
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}