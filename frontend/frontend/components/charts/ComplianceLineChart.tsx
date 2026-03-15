'use client'

import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from 'recharts'

interface CompliancePoint {
  date: string
  compliance: number
  violations: number
}

interface ComplianceLineChartProps {
  data: CompliancePoint[]
  loading?: boolean
}

function getComplianceColor(value: number): string {
  if (value >= 90) return 'var(--green)'
  if (value >= 70) return 'var(--amber)'
  return 'var(--red)'
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const compliance = payload.find((p) => p.dataKey === 'compliance')?.value as number | undefined
  const violations = payload.find((p) => p.dataKey === 'violations')?.value as number | undefined

  return (
    <div
      style={{
        background: 'var(--bg-overlay)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        minWidth: 150,
      }}
    >
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
        {label}
      </div>

      {compliance !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Compliance
          </span>
          <span
            style={{
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 700,
              color: getComplianceColor(compliance),
            }}
          >
            {compliance}%
          </span>
        </div>
      )}

      {violations !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Violations
          </span>
          <span
            style={{
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--amber)',
            }}
          >
            {violations}
          </span>
        </div>
      )}
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

export function ComplianceLineChart({ data, loading = false }: ComplianceLineChartProps) {
  const HEIGHT = 220

  // Determine line color based on the most recent compliance value
  const latestCompliance = useMemo(() => {
    if (!data.length) return 100
    return data[data.length - 1].compliance
  }, [data])

  const lineColor = getComplianceColor(latestCompliance)

  if (loading) return <ChartSkeleton height={HEIGHT} />

  return (
    <ResponsiveContainer width="100%" height={HEIGHT}>
      <LineChart data={data} margin={{ top: 8, right: 40, left: -20, bottom: 0 }}>
        <CartesianGrid
          horizontal
          vertical={false}
          strokeDasharray="4 4"
          stroke="var(--border)"
          strokeOpacity={0.5}
        />

        {/* Reference lines at key thresholds */}
        <ReferenceLine y={90} stroke="var(--green)"  strokeDasharray="3 3" strokeOpacity={0.35} strokeWidth={1} />
        <ReferenceLine y={70} stroke="var(--amber)"  strokeDasharray="3 3" strokeOpacity={0.35} strokeWidth={1} />

        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          dy={4}
        />

        {/* Primary Y-axis: compliance % */}
        <YAxis
          yAxisId="left"
          domain={[0, 100]}
          tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          width={36}
        />

        {/* Secondary Y-axis: violation count */}
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-bright)', strokeWidth: 1 }} />

        {/* Compliance line — dynamic color */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="compliance"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: lineColor, stroke: 'var(--bg-surface)', strokeWidth: 2 }}
          style={{ filter: `drop-shadow(0 0 6px ${lineColor})` }}
        />

        {/* Violation count on secondary axis */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="violations"
          stroke="var(--amber)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
          activeDot={{ r: 3, fill: 'var(--amber)', stroke: 'var(--bg-surface)', strokeWidth: 2 }}
          strokeOpacity={0.7}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
