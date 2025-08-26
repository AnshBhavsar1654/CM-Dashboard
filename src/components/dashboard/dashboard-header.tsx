// renders the header bar for the dashboard

"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Handshake, RefreshCw } from "lucide-react";
import { revalidateAndFetchEvents } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

/**
 * - Branding (Handshake icon + title)
 * - Theme toggle (dark/light mode)
 * - Force Refresh button (to revalidate data from server) 
 */
export function DashboardHeader() {
  const router = useRouter(); // Gives access to Next.js router for refreshing the page
  const { toast } = useToast(); // Hook to trigger toast notifications
  const [isRefreshing, setIsRefreshing] = React.useState(false); // Local state to track refresh progress

  /**
   * Triggers a manual revalidation of dashboard data:
   * 1. Calls the server action `revalidateAndFetchEvents`
   * 2. Refreshes the Next.js router cache
   * 3. Shows success/error toasts depending on the outcome
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('Refreshing dashboard data...');

      // Call server action to revalidate data and fetch updated event count
      const eventCount = await revalidateAndFetchEvents();

      console.log(`Refresh completed. Event count: ${eventCount}`);

      // Force Next.js to refresh cached data
      router.refresh();

      // Show success notification with event count
      toast({
        title: "Success",
        description: `Dashboard data has been refreshed. Fetched ${eventCount} events.`,
      });
    } catch (error) {
      console.error("Failed to refresh data:", error);

      // Show error notification
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh dashboard data.",
      });
    } finally {
      setIsRefreshing(false); // Reset refresh state regardless of outcome
    }
  };

  return (
    <header
      className="
        sticky top-0 z-[1200] 
        flex h-16 items-center gap-4 
        border-b border-border/50 
        bg-background/80 backdrop-blur-xl 
        px-4 md:px-8 
        bg-gradient-to-r from-background/90 via-background/80 to-primary/5 
        dark:bg-background 
        shadow-lg
      "
    >
      {/* Branding Section (Logo + Title) */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg">
          <Handshake className="h-6 w-6 text-primary-foreground" />
        </div>

        <h1 className="text-xl font-bold tracking-tight font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Gujarat CM Outreach Insights
          <div className="text-sm font-normal text-muted-foreground mt-1">
            (August 2024 onwards)
          </div>
        </h1>
      </div>

      {/* Action Buttons (Theme toggle + Refresh) */}
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-primary/20 hover:border-primary/40"
        >
          {/* Show spinning icon when refreshing */}
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Force Refresh'}
        </Button>
      </div>
    </header>
  );
}