// wraps the app with next-themes ThemeProvider
// provides light/dark/system theme switching support

"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Wraps children inside NextThemesProvider
  // so that theme context is available globally
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}