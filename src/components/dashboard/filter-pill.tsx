"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const filterPillVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary/10 text-primary",
        secondary: "border-secondary bg-secondary/10 text-secondary-foreground",
        destructive: "border-destructive/20 bg-destructive/10 text-destructive",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface FilterPillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof filterPillVariants> {
  onRemove?: () => void
  removable?: boolean
}

const FilterPill = React.forwardRef<HTMLDivElement, FilterPillProps>(
  ({ className, variant, children, onRemove, removable = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(filterPillVariants({ variant }), className)}
        {...props}
      >
        <span className="max-w-[120px] truncate">{children}</span>
        {removable && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-4 w-4 rounded-full p-0 hover:bg-muted-foreground/10"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
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
