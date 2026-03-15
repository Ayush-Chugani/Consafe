'use client'
import { useState, useEffect, useRef } from 'react'

export function useCountUp(target: number, duration = 1200, startFrom = 0): number {
  const [value, setValue] = useState(startFrom)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (target === startFrom) { setValue(target); return }
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(startFrom + (target - startFrom) * eased))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration, startFrom])

  return value
}
