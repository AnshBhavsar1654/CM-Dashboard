"use client";

import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DistrictsNotCoveredCardProps {
  notCoveredDistricts: string[];
}

export function DistrictsNotCoveredCard({ notCoveredDistricts }: DistrictsNotCoveredCardProps) {
  return (
    <Card className="mx-auto w-full max-w-[350px] h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Districts Not Covered
        </CardTitle>
        <AlertCircle className="h-4 w-4 text-destructive" />
      </CardHeader>
      <CardContent className="px-4 pb-4 flex-grow flex flex-col">
        {notCoveredDistricts.length > 0 ? (
          <>
            <div className="text-3xl font-bold tracking-tight text-destructive">
              {notCoveredDistricts.length}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {notCoveredDistricts.map((district, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                >
                  {district}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="text-3xl font-bold text-green-500 tracking-tight">0</div>
        )}
        <p className="text-xs text-muted-foreground mt-2 flex-shrink-0">
          {notCoveredDistricts.length > 0
            ? `${notCoveredDistricts.length} of 33 districts not visited yet`
            : "All 33 districts covered!"}
        </p>
      </CardContent>
    </Card>
  );
}
