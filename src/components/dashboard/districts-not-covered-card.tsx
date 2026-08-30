"use client";

import { MapPin, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

interface DistrictsNotCoveredCardProps {
  notCoveredDistricts: string[];
}

export function DistrictsNotCoveredCard({ notCoveredDistricts }: DistrictsNotCoveredCardProps) {
  const displayDistricts = notCoveredDistricts.slice(0, 5);
  const remainingCount = Math.max(0, notCoveredDistricts.length - 5);

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
            <div className="mt-2 space-y-1 flex-grow overflow-y-auto">
              {displayDistricts.map((district, _index) => (
                <div key={_index} className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                  <span className="truncate">{district}</span>
                </div>
              ))}
              {remainingCount > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" className="px-0 h-auto text-xs text-muted-foreground mt-1">
                      +{remainingCount} more
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Unvisited Districts</DialogTitle>
                      <DialogDescription>Full list of districts not covered yet.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[50vh] overflow-y-auto mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {notCoveredDistricts.map((district, idx) => (
                        <div key={`${district}-${idx}`} className="flex items-center text-sm">
                          <MapPin className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                          <span className="truncate" title={district}>{district}</span>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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
