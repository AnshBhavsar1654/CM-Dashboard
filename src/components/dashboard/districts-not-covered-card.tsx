"use client";

import { MapPin, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DistrictsNotCoveredCardProps {
  notCoveredDistricts: string[];
}

export function DistrictsNotCoveredCard({ notCoveredDistricts }: DistrictsNotCoveredCardProps) {
  // Limit to show only first 5 districts for UI clarity
  const displayDistricts = notCoveredDistricts.slice(0, 5);
  const remainingCount = Math.max(0, notCoveredDistricts.length - 5);

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-red-500/10 border border-red-500/30 shadow-lg hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300 hover:scale-105 group dark:bg-card dark:border-red-500/50 dark:hover:shadow-red-500/30 dark:hover:border-red-500/60 mx-auto w-full max-w-[350px] h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3 flex-shrink-0">
        <CardTitle className="text-base font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Districts Not Covered</CardTitle>
        <AlertCircle className="h-8 w-8 text-red-600 group-hover:scale-110 transition-transform duration-200 dark:text-red-400" />
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 flex-grow flex flex-col">
        {notCoveredDistricts.length > 0 ? (
          <>
            <div className="text-4xl font-bold dark:text-red-400 leading-none">{notCoveredDistricts.length}</div>
            <div className="mt-2 space-y-1 flex-grow overflow-y-auto">
              {displayDistricts.map((district, _index) => (
                <div key={_index} className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                  <span className="truncate">{district}</span>
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="text-sm text-muted-foreground mt-1">
                  + {remainingCount} more district{remainingCount > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-4xl font-bold text-green-500 leading-none">0</div>
        )}
        <p className="text-sm text-muted-foreground mt-2 flex-shrink-0">
          {notCoveredDistricts.length > 0 
            ? `${notCoveredDistricts.length} of 33 Districts not visited yet` 
            : "All 33 Districts covered!"}
        </p>
      </CardContent>
    </Card>
  );
}