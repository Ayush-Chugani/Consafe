'use client'

import React from 'react'
import type { AttendanceSummary } from '@/api/types'

interface Props {
  summary: AttendanceSummary
}

export default function AttendanceSummaryBar({ summary }: Props) {
  const { present, absent, late, onLeave, total } = summary
  const safe = total || 1

  const segments = [
    { label: 'Present',  value: present,  color: 'var(--green)',    pct: (present  / safe) * 100 },
    { label: 'Absent',   value: absent,   color: 'var(--red)',      pct: (absent   / safe) * 100 },
    { label: 'Late',     value: late,     color: 'var(--amber)',    pct: (late     / safe) * 100 },
    { label: 'On Leave', value: onLeave,  color: '#60a5fa',         pct: (onLeave  / safe) * 100 },
  ]

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '14px 20px',
        minHeight: 60,
      }}
    >
      {/* Proportional bar */}
      <div
        style={{
          display: 'flex',
          height: 8,
          borderRadius: 4,
          overflow: 'hidden',
          gap: 2,
          marginBottom: 12,
        }}
      >
        {segments.map((seg) =>
          seg.value > 0 ? (
            <div
              key={seg.label}
              style={{
                flex: seg.pct,
                background: seg.color,
                borderRadius: 4,
                transition: 'flex 0.5s ease',
              }}
              title={`${seg.label}: ${seg.value}`}
            />
          ) : null
        )}
      </div>

      {/* Counters */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {segments.map((seg) => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: seg.color,
                flexShrink: 0,
              }}
            />
            <div>
              <span
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: 16,
                  fontWeight: 600,
                  color: seg.color,
                  marginRight: 4,
                }}
              >
                {seg.value}
              </span>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                }}
              >
                {seg.label}
              </span>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  marginLeft: 4,
                }}
              >
                ({seg.pct.toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
            TOTAL
          </span>
          <span
            style={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {total}
          </span>
        </div>
      </div>
    </div>
  )
}
