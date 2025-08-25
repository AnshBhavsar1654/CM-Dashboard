"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Handshake, RefreshCw } from "lucide-react";
import { revalidateAndFetchEvents } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

export function DashboardHeader() {
  const router = useRouter();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('Refreshing dashboard data...');
      const eventCount = await revalidateAndFetchEvents();
      console.log(`Refresh completed. Event count: ${eventCount}`);
      router.refresh();
      toast({
        title: "Success",
        description: `Dashboard data has been refreshed. Fetched ${eventCount} events.`,
      });
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh dashboard data.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="sticky top-0 z-[1200] flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 md:px-8 bg-gradient-to-r from-background/90 via-background/80 to-primary/5 dark:bg-background shadow-lg">
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
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-primary/20 hover:border-primary/40"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Force Refresh'}
        </Button>
      </div>
    </header>
  );
}
