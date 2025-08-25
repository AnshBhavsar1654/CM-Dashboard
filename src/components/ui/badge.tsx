import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-primary/20 dark:bg-primary dark:shadow-primary/30",
        secondary:
          "border-transparent bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/70 shadow-secondary/20 dark:bg-secondary dark:shadow-secondary/30",
        destructive:
          "border-transparent bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:from-destructive/90 hover:to-destructive/70 shadow-destructive/20 dark:bg-destructive dark:shadow-destructive/30",
        outline: "text-foreground border-border/50 hover:border-border/70 bg-background/50 backdrop-blur-sm dark:border-primary/30 dark:bg-background/20 dark:hover:bg-accent/20 dark:hover:border-primary/50 hover:scale-105",
        success:
          "border-transparent bg-gradient-to-r from-success to-success/80 text-success-foreground hover:from-success/90 hover:to-success/70 shadow-success/20 dark:bg-success dark:shadow-success/30",
        warning:
          "border-transparent bg-gradient-to-r from-warning to-warning/80 text-warning-foreground hover:from-warning/90 hover:to-warning/70 shadow-warning/20 dark:bg-warning dark:shadow-warning/30",
        info:
          "border-transparent bg-gradient-to-r from-info to-info/80 text-info-foreground hover:from-info/90 hover:to-info/70 shadow-info/20 dark:bg-info dark:shadow-info/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
