'use client'

import React from 'react'

type BadgeVariant = 'default' | 'cyan' | 'green' | 'red' | 'amber' | 'violet' | 'orange' | 'gray'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  pulse?: boolean
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  default: { bg: 'var(--bg-elevated)',    color: 'var(--text-secondary)', border: 'var(--border)' },
  cyan:    { bg: 'var(--cyan-dim)',        color: 'var(--cyan)',           border: 'rgba(0,212,255,0.25)' },
  green:   { bg: 'var(--green-dim)',       color: 'var(--green)',          border: 'rgba(0,229,160,0.25)' },
  red:     { bg: 'var(--red-dim)',         color: 'var(--red)',            border: 'rgba(255,77,106,0.25)' },
  amber:   { bg: 'var(--amber-dim)',       color: 'var(--amber)',          border: 'rgba(245,158,11,0.25)' },
  violet:  { bg: 'var(--violet-dim)',      color: 'var(--violet)',         border: 'rgba(167,139,250,0.25)' },
  orange:  { bg: 'var(--orange-dim)',      color: 'var(--orange)',         border: 'rgba(251,146,60,0.25)' },
  gray:    { bg: 'rgba(66,74,94,0.20)',    color: 'var(--text-muted)',     border: 'var(--border)' },
}

const SIZE_STYLES: Record<BadgeSize, { padding: string; fontSize: number; gap: number; dotSize: number }> = {
  sm: { padding: '1px 6px',  fontSize: 10, gap: 4, dotSize: 5 },
  md: { padding: '3px 9px',  fontSize: 11, gap: 5, dotSize: 6 },
}

export function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  pulse = false,
  children,
  className,
  style,
}: BadgeProps) {
  const v = VARIANT_STYLES[variant]
  const s = SIZE_STYLES[size]

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        padding: s.padding,
        borderRadius: 999,
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        fontSize: s.fontSize,
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        letterSpacing: '0.03em',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: s.dotSize,
            height: s.dotSize,
            borderRadius: '50%',
            background: v.color,
            flexShrink: 0,
            animation: pulse ? 'pulseDot 2s ease infinite' : undefined,
          }}
        />
      )}
      {children}
    </span>
  )
}
