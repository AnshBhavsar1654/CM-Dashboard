"use client"

import * as React from "react"

export function useCountUp(target: number, duration = 800): number {
  const [display, setDisplay] = React.useState(0)
  const rafRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (target === 0) {
      setDisplay(0)
      return
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setDisplay(target)
      return
    }

    const start = performance.now()
    const from = 0

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (target - from) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return display
}
