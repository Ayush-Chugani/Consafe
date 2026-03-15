'use client'

import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

type StatColor = 'cyan' | 'green' | 'red' | 'amber'

interface StatCardProps {
  label: string
  value: string | number
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  color?: StatColor
  loading?: boolean
  pulse?: boolean
  className?: string
  style?: React.CSSProperties
  'data-reveal'?: string
}

const COLOR_VARS: Record<StatColor, { color: string; dim: string; glow: string; border: string }> = {
  cyan:  { color: 'var(--cyan)',  dim: 'var(--cyan-dim)',  glow: 'var(--cyan-glow)',  border: 'rgba(0,212,255,0.30)' },
  green: { color: 'var(--green)', dim: 'var(--green-dim)', glow: 'var(--green-glow)', border: 'rgba(0,229,160,0.25)' },
  red:   { color: 'var(--red)',   dim: 'var(--red-dim)',   glow: 'var(--red-glow)',   border: 'rgba(255,77,106,0.25)' },
  amber: { color: 'var(--amber)', dim: 'var(--amber-dim)', glow: 'var(--amber-glow)', border: 'rgba(245,158,11,0.25)' },
}

function SkeletonBlock({ w, h }: { w: string; h: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 4,
        background: 'var(--bg-elevated)',
        backgroundImage: 'linear-gradient(90deg,var(--bg-elevated) 25%,var(--bg-overlay) 50%,var(--bg-elevated) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease infinite',
      }}
    />
  )
}

export function StatCard({
  label,
  value,
  trend,
  trendLabel,
  icon,
  color = 'cyan',
  loading = false,
  pulse = false,
  className,
  style,
  ...rest
}: StatCardProps) {
  const cv = COLOR_VARS[color]
  const trendPositive = trend !== undefined && trend >= 0

  return (
    <div
      className={className}
      data-reveal={rest['data-reveal']}
      style={{
        position: 'relative',
        background: 'var(--bg-surface)',
        border: `1px solid var(--border)`,
        borderBottom: `2px solid ${cv.color}`,
        borderRadius: 12,
        padding: '18px 20px',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        cursor: 'default',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 28px ${cv.glow}`
        e.currentTarget.style.borderColor = cv.border
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      {/* Icon in top-right */}
      {icon && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: cv.color,
            opacity: 0.18,
          }}
        >
          {icon}
        </div>
      )}

      {/* Pulse ring for "active" cards */}
      {pulse && !loading && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: cv.color,
            animation: 'pulseDot 2s ease infinite',
            boxShadow: `0 0 8px ${cv.color}`,
          }}
        />
      )}

      {/* Label */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 500,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        {label}
      </div>

      {/* Value */}
      {loading ? (
        <SkeletonBlock w="55%" h={32} />
      ) : (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            marginBottom: 10,
          }}
        >
          {value}
        </div>
      )}

      {/* Trend */}
      {trend !== undefined && !loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            color: trendPositive ? 'var(--green)' : 'var(--red)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(trend)}%</span>
          {trendLabel && (
            <span style={{ color: 'var(--text-muted)', marginLeft: 2 }}>
              {trendLabel}
            </span>
          )}
        </div>
      ) : loading ? (
        <SkeletonBlock w="35%" h={12} />
      ) : null}
    </div>
  )
}
