'use client'

import React from 'react'
import { Cpu, AlertTriangle, Users } from 'lucide-react'
import { useJobStore } from '@/store/jobStore'

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  color: string
  bg: string
  border: string
}

function MetricCard({ icon, label, value, color, bg, border }: MetricCardProps) {
  return (
    <div
      data-reveal
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 10,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 40, height: 40,
          borderRadius: 8,
          background: 'var(--bg-surface)',
          border: `1px solid ${border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 22,
            fontWeight: 700,
            color,
            lineHeight: 1,
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
    </div>
  )
}

export default function MetricsCards() {
  const { processedFrames, metrics } = useJobStore()

  const framesWithViolations = metrics?.framesWithMissingPpe ?? 0
  const maxWorkers = metrics?.maxPeopleInFrame ?? 0

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <MetricCard
        icon={<Cpu size={18} style={{ color: 'var(--cyan)' }} />}
        label="FRAMES PROCESSED"
        value={processedFrames}
        color="var(--cyan)"
        bg="var(--cyan-dim)"
        border="var(--cyan-border, rgba(0,212,255,0.35))"
      />
      <MetricCard
        icon={<AlertTriangle size={18} style={{ color: 'var(--red)' }} />}
        label="FRAMES WITH VIOLATIONS"
        value={framesWithViolations}
        color="var(--red)"
        bg="var(--red-dim)"
        border="var(--red)33"
      />
      <MetricCard
        icon={<Users size={18} style={{ color: 'var(--amber)' }} />}
        label="MAX WORKERS IN FRAME"
        value={maxWorkers}
        color="var(--amber)"
        bg="var(--amber-dim)"
        border="var(--amber)33"
      />
    </div>
  )
}
