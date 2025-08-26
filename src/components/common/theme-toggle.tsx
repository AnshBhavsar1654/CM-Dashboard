// theme toggle button (light <-> dark)
// uses next-themes to switch app theme on click

"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

/**
 * ThemeToggle component:
 * Renders a button that toggles between light and dark mode.
 * Uses next-themes `useTheme` hook to update the current theme.
 */
export function ThemeToggle() {
  // Access current theme and theme setter from next-themes
  const { theme, setTheme } = useTheme()

  // Switch theme based on current state
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden border-primary/20 hover:border-primary/40 
                 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm"
    >
      {/* Sun icon → visible in light mode, hidden in dark mode */}
      <Sun
        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 
                   transition-all duration-300 
                   dark:-rotate-90 dark:scale-0 text-accent"
      />

      {/* Moon icon → hidden in light mode, visible in dark mode */}
      <Moon
        className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 
                   transition-all duration-300 
                   dark:rotate-0 dark:scale-100 text-primary"
      />

      {/* Screen reader accessible label */}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}