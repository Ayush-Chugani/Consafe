'use client'

import React, { useState } from 'react'
import type { AttendanceStatus } from '@/api/types'

interface DayData {
  date: string
  status: AttendanceStatus | null
  has_violations: boolean
}

interface Props {
  data: DayData[]
  onDayClick: (date: string) => void
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  date: string
  status: string
}

function cellColor(d: DayData): string {
  if (!d.status) return 'var(--bg-elevated)'
  if (d.status === 'present' && !d.has_violations) return 'var(--green)'
  if (d.status === 'present' && d.has_violations)  return 'var(--amber)'
  if (d.status === 'absent')   return 'var(--red)'
  if (d.status === 'late')     return '#f59e0b'
  if (d.status === 'on_leave') return '#60a5fa'
  return 'var(--bg-elevated)'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
}

const LEGEND = [
  { label: 'Present',          color: 'var(--green)' },
  { label: 'Present + Viol.',  color: 'var(--amber)' },
  { label: 'Absent',           color: 'var(--red)' },
  { label: 'On Leave',         color: '#60a5fa' },
  { label: 'No Data',          color: 'var(--bg-elevated)' },
]

export default function AttendanceHeatmap({ data, onDayClick }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, date: '', status: '' })

  // Pad to 30 slots
  const slots: (DayData | null)[] = Array.from({ length: 30 }, (_, i) => data[i] ?? null)

  return (
    <div style={{ position: 'relative' }}>
      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 32px)',
          gap: 6,
          marginBottom: 16,
        }}
      >
        {slots.map((day, i) => {
          const dayNum = day
            ? new Date(day.date).getDate()
            : i + 1

          return (
            <div
              key={i}
              onClick={() => day && onDayClick(day.date)}
              onMouseEnter={(e) => {
                if (!day) return
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                const statusLabel =
                  !day.status ? 'No data' :
                  day.status === 'present' && day.has_violations ? 'Present (violation)' :
                  day.status.replace('_', ' ').charAt(0).toUpperCase() + day.status.slice(1).replace('_', ' ')
                setTooltip({ visible: true, x: rect.left, y: rect.top - 36, date: day.date, status: statusLabel })
              }}
              onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
              style={{
                width: 32, height: 32,
                borderRadius: 5,
                background: day ? cellColor(day) : 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                cursor: day ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: day ? 1 : 0.4,
                transition: 'transform 0.1s, box-shadow 0.1s',
                boxShadow: day && day.status ? `0 0 8px ${cellColor(day)}44` : 'none',
              }}
              onMouseDown={(e) => { ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(0.92)' }}
              onMouseUp={(e) => { ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
            >
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  color: day?.status ? '#000' : 'var(--text-muted)',
                  fontWeight: 600,
                  pointerEvents: 'none',
                }}
              >
                {dayNum}
              </span>
            </div>
          )
        })}
      </div>

      {/* Tooltip (fixed position) */}
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '6px 10px',
            pointerEvents: 'none',
            zIndex: 999,
            transform: 'translateX(-50%)',
          }}
        >
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-primary)', marginBottom: 2 }}>
            {formatDate(tooltip.date)}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
            {tooltip.status}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {LEGEND.map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 10, height: 10,
                borderRadius: 2,
                background: l.color,
                border: '1px solid var(--border)',
              }}
            />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'var(--text-muted)' }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
