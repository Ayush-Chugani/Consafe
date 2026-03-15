'use client'

import React, { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  duration?: number
  className?: string
  style?: React.CSSProperties
  trigger?: boolean
}

function useCountUp(target: number, duration = 1200, startFrom = 0): number {
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

export function CountUp({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1200,
  className,
  style,
  trigger,
}: CountUpProps) {
  // Re-trigger by tracking a "seed" value
  const [seed, setSeed] = useState(0)
  const prevTrigger = useRef(trigger)

  useEffect(() => {
    if (trigger !== prevTrigger.current) {
      prevTrigger.current = trigger
      if (trigger) setSeed((s) => s + 1)
    }
  }, [trigger])

  // We multiply/divide by 10^decimals to handle decimal counting
  const factor = Math.pow(10, decimals)
  const intTarget = Math.round(value * factor)
  const rawCount = useCountUp(intTarget, duration)
  const displayValue = (rawCount / factor).toFixed(decimals)

  return (
    <span
      className={className}
      style={{
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {prefix}{displayValue}{suffix}
    </span>
  )
}
