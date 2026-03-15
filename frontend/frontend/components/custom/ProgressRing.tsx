'use client'

import React, { useEffect, useRef } from 'react'

interface ProgressRingProps {
  value: number              // 0–100
  size?: number              // diameter in px, default 80
  strokeWidth?: number       // default 6
  color?: string             // CSS color or var(), default var(--cyan)
  trackColor?: string        // default var(--border)
  label?: React.ReactNode    // center content
  animDuration?: number      // ms, default 600
  className?: string
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  color = 'var(--cyan)',
  trackColor = 'var(--border)',
  label,
  animDuration = 600,
  className,
}: ProgressRingProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedValue / 100) * circumference

  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const el = circleRef.current
    if (!el) return
    // Trigger transition smoothly
    el.style.transition = `stroke-dashoffset ${animDuration}ms cubic-bezier(0.4,0,0.2,1)`
    el.style.strokeDashoffset = String(offset)
  }, [offset, animDuration])

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference} // start from 0, animate to value
          style={{
            filter: `drop-shadow(0 0 4px ${color})`,
          }}
        />
      </svg>

      {/* Center label */}
      {label !== undefined && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}
