'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'

interface SafetyDistributionData {
  excellent: number  // >95%
  good: number       // 85–95%
  at_risk: number    // 70–85%
  critical: number   // <70%
  total: number
}

interface SafetyScoreDonutProps {
  data: SafetyDistributionData
  loading?: boolean
}

const SEGMENTS = [
  { key: 'excellent', label: 'Excellent',  color: 'var(--green)' },
  { key: 'good',      label: 'Good',       color: 'var(--cyan)'  },
  { key: 'at_risk',   label: 'At Risk',    color: 'var(--amber)' },
  { key: 'critical',  label: 'Critical',   color: 'var(--red)'   },
] as const

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div
      style={{
        background: 'var(--bg-overlay)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
        {entry.name}
      </div>
      <div
        style={{
          fontSize: 16,
          fontFamily: 'var(--font-mono)',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 700,
          color: entry.payload?.color ?? 'var(--text-primary)',
        }}
      >
        {entry.value}
      </div>
    </div>
  )
}

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: 8,
        background: 'var(--bg-elevated)',
        backgroundImage: 'linear-gradient(90deg,var(--bg-elevated) 25%,var(--bg-overlay) 50%,var(--bg-elevated) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease infinite',
      }}
    />
  )
}

export function SafetyScoreDonut({ data, loading = false }: SafetyScoreDonutProps) {
  const HEIGHT = 220

  if (loading) return <ChartSkeleton height={HEIGHT} />

  const chartData = SEGMENTS
    .map((s) => ({
      name:  s.label,
      value: data[s.key] ?? 0,
      color: s.color,
    }))
    .filter((d) => d.value > 0)

  // Custom center label using absolute positioning trick
  return (
    <div style={{ height: HEIGHT, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="72%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.color}
                  style={{ filter: `drop-shadow(0 0 4px ${entry.color})`, outline: 'none' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center total */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            {data.total}
          </div>
          <div
            style={{
              fontSize: 9,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: 3,
            }}
          >
            Workers
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 12px',
          justifyContent: 'center',
          paddingBottom: 4,
        }}
      >
        {SEGMENTS.map((s) => {
          const count = data[s.key] ?? 0
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: s.color,
                  flexShrink: 0,
                  boxShadow: `0 0 4px ${s.color}`,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {s.label}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: s.color,
                  fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
