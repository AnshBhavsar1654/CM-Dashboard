"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * `filterPillVariants` defines the different style variations for the `FilterPill` component
 * Each variant corresponds to a type of visual emphasis (default, secondary, destructive, etc.).
 * This allows us to reuse the same `FilterPill` component with multiple looks without duplicating CSS.
 */
const filterPillVariants = cva(
  // Base styling for all pills (shared classes)
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm backdrop-blur-sm hover:scale-110 hover:shadow-lg",
  {
    variants: {
      variant: {
        default:
          "border-primary/40 bg-gradient-to-br from-primary/20 to-primary/10 text-primary hover:from-primary/30 hover:to-primary/20 hover:shadow-primary/20 dark:border-primary/60 dark:bg-gradient-to-br dark:from-primary/30 dark:to-primary/20 dark:hover:from-primary/40 dark:hover:to-primary/30 dark:hover:shadow-primary/30",
        secondary:
          "border-secondary/40 bg-gradient-to-br from-secondary/30 to-secondary/20 text-secondary-foreground hover:from-secondary/40 hover:to-secondary/30 hover:shadow-secondary/20 dark:border-secondary/60 dark:bg-gradient-to-br dark:from-secondary/40 dark:to-secondary/30 dark:hover:from-secondary/50 dark:hover:to-secondary/40 dark:hover:shadow-secondary/30",
        destructive:
          "border-destructive/40 bg-gradient-to-br from-destructive/20 to-destructive/10 text-destructive hover:from-destructive/30 hover:to-destructive/20 hover:shadow-destructive/20 dark:border-destructive/60 dark:bg-gradient-to-br dark:from-destructive/30 dark:to-destructive/20 dark:hover:from-destructive/40 dark:hover:to-destructive/30 dark:hover:shadow-destructive/30",
        accent:
          "border-accent/40 bg-gradient-to-br from-accent/30 to-accent/20 text-accent-foreground hover:from-accent/40 hover:to-accent/30 hover:shadow-accent/20 dark:border-accent/60 dark:bg-gradient-to-br dark:from-accent/40 dark:to-accent/30 dark:hover:from-accent/50 dark:hover:to-accent/40 dark:hover:shadow-accent/30",
        success:
          "border-success/40 bg-gradient-to-br from-success/20 to-success/10 text-success hover:from-success/30 hover:to-success/20 hover:shadow-success/20 dark:border-success/60 dark:bg-gradient-to-br dark:from-success/30 dark:to-success/20 dark:hover:from-success/40 dark:hover:to-success/30 dark:hover:shadow-success/30",
        warning:
          "border-warning/40 bg-gradient-to-br from-warning/30 to-warning/20 text-warning-foreground hover:from-warning/40 hover:to-warning/30 hover:shadow-warning/20 dark:border-warning/60 dark:bg-gradient-to-br dark:from-warning/40 dark:to-warning/30 dark:hover:from-warning/50 dark:hover:to-warning/40 dark:hover:shadow-warning/30",
        info:
          "border-info/40 bg-gradient-to-br from-info/30 to-info/20 text-info-foreground hover:from-info/40 hover:to-info/30 hover:shadow-info/20 dark:border-info/60 dark:bg-gradient-to-br dark:from-info/40 dark:to-info/30 dark:hover:from-info/50 dark:hover:to-info/40 dark:hover:shadow-info/30",
        outline: 
          "border-white/30 bg-background/40 text-foreground hover:bg-background/60 hover:shadow-white/20 dark:border-white/20 dark:bg-background/30 dark:hover:bg-background/50 dark:hover:shadow-white/10",
      },
    },
    // Default style variant (when no `variant` prop is passed)
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * - `variant`: controls the visual style (matches keys in `filterPillVariants`)
 * - `onRemove`: callback function triggered when the "remove" (X) button is clicked
 * - `removable`: whether the pill should render a remove button (default = true)
 * - Inherits any additional `div` HTML attributes (like `onClick`, `className`, etc.)
 */
export interface FilterPillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof filterPillVariants> {
  onRemove?: () => void
  removable?: boolean
}


// `FilterPill` is a reusable UI component that represents a selected filter or tag.
const FilterPill = React.forwardRef<HTMLDivElement, FilterPillProps>(
  ({ className, variant, children, onRemove, removable = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(filterPillVariants({ variant }), className)}
        {...props}
      >
        {/* Truncate long labels so they don't overflow */}
        <span className="max-w-[120px] truncate">{children}</span>

        {/* Optional remove button (only shows if `removable` is true) */}
        {removable && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-4 w-4 rounded-full p-0 hover:bg-muted-foreground/10"
            onClick={(e) => {
              e.stopPropagation() // prevent parent click handlers from firing
              onRemove?.()        // call provided callback if defined
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }
)
FilterPill.displayName = "FilterPill"

export { FilterPill, filterPillVariants }