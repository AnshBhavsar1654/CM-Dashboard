"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { RefreshCw } from "lucide-react";
import { revalidateAndFetchEvents } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

export function DashboardHeader() {
  const router = useRouter();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const eventCount = await revalidateAndFetchEvents();
      router.refresh();
      toast({
        title: "Success",
        description: `Dashboard data has been refreshed. Fetched ${eventCount} events.`,
      });
    } catch {
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
    <header className="flex h-14 items-center justify-end border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    </header>
  );
}
