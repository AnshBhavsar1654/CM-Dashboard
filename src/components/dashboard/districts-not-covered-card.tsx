"use client";

import { MapPin, AlertCircle } from "lucide-react"; // Icons for UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

interface DistrictsNotCoveredCardProps {
  notCoveredDistricts: string[]; // List of district names not covered
}

export function DistrictsNotCoveredCard({ notCoveredDistricts }: DistrictsNotCoveredCardProps) {
  // Limit visible list to 5 districts for cleaner UI
  const displayDistricts = notCoveredDistricts.slice(0, 5);
  
  // Count how many districts remain hidden beyond the first 5
  const remainingCount = Math.max(0, notCoveredDistricts.length - 5);

  return (
    <Card 
      className="
        bg-gradient-to-br from-card via-card/95 to-red-500/10 
        border border-red-500/30 
        shadow-lg hover:shadow-xl hover:shadow-red-500/20 
        transition-all duration-300 hover:scale-105 group 
        dark:bg-card dark:border-red-500/50 dark:hover:shadow-red-500/30 dark:hover:border-red-500/60 
        mx-auto w-full max-w-[350px] h-full flex flex-col
      "
    >
      {/* ===== Card Header ===== */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-3 flex-shrink-0">
        {/* Title */}
        <CardTitle className="text-base font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Districts Not Covered
        </CardTitle>

        {/* Warning icon */}
        <AlertCircle className="h-8 w-8 text-red-600 group-hover:scale-110 transition-transform duration-200 dark:text-red-400" />
      </CardHeader>

      {/* ===== Card Content ===== */}
      <CardContent className="px-3 pb-3 pt-0 flex-grow flex flex-col">
        {notCoveredDistricts.length > 0 ? (
          <>
            {/* Total count of not covered districts */}
            <div className="text-4xl font-bold dark:text-red-400 leading-none">
              {notCoveredDistricts.length}
            </div>

            {/* List of up to 5 districts */
            }
            <div className="mt-2 space-y-1 flex-grow overflow-y-auto">
              {displayDistricts.map((district, _index) => (
                <div key={_index} className="flex items-center text-sm">
                  {/* Location icon */}
                  <MapPin className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                  <span className="truncate">{district}</span>
                </div>
              ))}

              {/* Show "+X more" if there are hidden districts */}
              {remainingCount > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" className="px-0 h-auto text-sm text-muted-foreground mt-1">
                      + {remainingCount} more district{remainingCount > 1 ? 's' : ''}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Unvisited Districts</DialogTitle>
                      <DialogDescription>
                        Full list of districts not covered yet.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[50vh] overflow-y-auto mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {notCoveredDistricts.map((district, idx) => (
                        <div key={`${district}-${idx}`} className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
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
          // If all districts are covered, show "0" with green highlight
          <div className="text-4xl font-bold text-green-500 leading-none">0</div>
        )}

        {/* Footer info: summary text */}
        <p className="text-sm text-muted-foreground mt-2 flex-shrink-0">
          {notCoveredDistricts.length > 0 
            ? `${notCoveredDistricts.length} of 33 Districts not visited yet` 
            : "All 33 Districts covered!"}
        </p>
      </CardContent>
    </Card>
  );
}