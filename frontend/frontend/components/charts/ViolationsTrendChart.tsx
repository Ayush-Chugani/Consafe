'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'

interface ViolationTrendPoint {
  date: string
  total: number
  resolved: number
}

interface ViolationsTrendChartProps {
  data: ViolationTrendPoint[]
  loading?: boolean
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--bg-overlay)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        minWidth: 130,
      }}
    >
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
        {label}
      </div>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--text-primary)',
            marginTop: 3,
          }}
        >
          <span style={{ width: 8, height: 2, background: entry.color as string, flexShrink: 0, display: 'inline-block' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: 10, textTransform: 'capitalize' }}>
            {entry.dataKey}:
          </span>
          <span style={{ color: entry.color as string, fontWeight: 600 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function CustomLegend() {
  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
      {[
        { color: 'var(--amber)', label: 'Total', dashed: false },
        { color: 'var(--green)', label: 'Resolved', dashed: true },
      ].map(({ color, label, dashed }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width={20} height={4}>
            <line
              x1={0} y1={2} x2={20} y2={2}
              stroke={color}
              strokeWidth={2}
              strokeDasharray={dashed ? '4 2' : undefined}
            />
          </svg>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {label}
          </span>
        </div>
      ))}
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

export function ViolationsTrendChart({ data, loading = false }: ViolationsTrendChartProps) {
  const HEIGHT = 220

  if (loading) return <ChartSkeleton height={HEIGHT} />

  return (
    <div style={{ height: HEIGHT }}>
      <ResponsiveContainer width="100%" height={HEIGHT - 28}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid
            horizontal
            vertical={false}
            strokeDasharray="4 4"
            stroke="var(--border)"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            dy={4}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-bright)', strokeWidth: 1 }} />

          {/* Total violations — amber solid line */}
          <Line
            type="monotone"
            dataKey="total"
            stroke="var(--amber)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--amber)', stroke: 'var(--bg-surface)', strokeWidth: 2 }}
          />

          {/* Resolved — green dashed line */}
          <Line
            type="monotone"
            dataKey="resolved"
            stroke="var(--green)"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 3, fill: 'var(--green)', stroke: 'var(--bg-surface)', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <CustomLegend />
    </div>
  )
}
