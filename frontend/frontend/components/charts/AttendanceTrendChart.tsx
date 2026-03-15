'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'

interface AttendanceTrendPoint {
  date: string
  present: number
  absent: number
}

interface AttendanceTrendChartProps {
  data: AttendanceTrendPoint[]
  loading?: boolean
}

/* ─── Custom Tooltip ─────────────────────────────────────────── */
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
        minWidth: 120,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}
      >
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
            color: entry.color as string,
            fontVariantNumeric: 'tabular-nums',
            marginTop: 3,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: entry.color as string,
              flexShrink: 0,
            }}
          />
          <span style={{ color: 'var(--text-secondary)', fontSize: 10, textTransform: 'capitalize' }}>
            {entry.dataKey}:
          </span>
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────── */
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

/* ─── AttendanceTrendChart ───────────────────────────────────── */
export function AttendanceTrendChart({ data, loading = false }: AttendanceTrendChartProps) {
  const HEIGHT = 220

  if (loading) return <ChartSkeleton height={HEIGHT} />

  return (
    <ResponsiveContainer width="100%" height={HEIGHT}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--cyan)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0.02} />
          </linearGradient>
        </defs>

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

        {/* Present area */}
        <Area
          type="monotone"
          dataKey="present"
          stroke="var(--cyan)"
          strokeWidth={2}
          fill="url(#presentGrad)"
          dot={false}
          activeDot={{ r: 4, fill: 'var(--cyan)', stroke: 'var(--bg-surface)', strokeWidth: 2 }}
        />

        {/* Absent line only — no fill */}
        <Area
          type="monotone"
          dataKey="absent"
          stroke="var(--red)"
          strokeWidth={1.5}
          strokeDasharray="5 3"
          fill="none"
          dot={false}
          activeDot={{ r: 3, fill: 'var(--red)', stroke: 'var(--bg-surface)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
