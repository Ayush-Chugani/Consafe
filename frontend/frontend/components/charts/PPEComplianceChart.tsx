'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  TooltipProps,
} from 'recharts'

interface PPECategory {
  category: string
  compliance: number
}

interface PPEComplianceChartProps {
  data: PPECategory[]
  loading?: boolean
}

function getBarColor(compliance: number): string {
  if (compliance >= 90) return 'var(--green)'
  if (compliance >= 70) return 'var(--amber)'
  return 'var(--red)'
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const value = payload[0].value as number
  return (
    <div
      style={{
        background: 'var(--bg-overlay)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontFamily: 'var(--font-mono)',
          fontVariantNumeric: 'tabular-nums',
          color: getBarColor(value),
          fontWeight: 700,
        }}
      >
        {value}%
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

export function PPEComplianceChart({ data, loading = false }: PPEComplianceChartProps) {
  const HEIGHT = 220

  if (loading) return <ChartSkeleton height={HEIGHT} />

  return (
    <ResponsiveContainer width="100%" height={HEIGHT}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 40, left: 0, bottom: 4 }}
      >
        <CartesianGrid
          horizontal={false}
          vertical
          strokeDasharray="4 4"
          stroke="var(--border)"
          strokeOpacity={0.4}
        />

        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />

        <YAxis
          type="category"
          dataKey="category"
          tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          width={80}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />

        <Bar dataKey="compliance" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={getBarColor(entry.compliance)} />
          ))}
          <LabelList
            dataKey="compliance"
            position="right"
            formatter={(v: number) => `${v}%`}
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
              fill: 'var(--text-secondary)',
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
