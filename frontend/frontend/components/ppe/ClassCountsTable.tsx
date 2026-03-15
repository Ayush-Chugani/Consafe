'use client'

import React from 'react'
import { useJobStore } from '@/store/jobStore'
import type { PpeClassCount } from '@/api/types'

// Equipment items that are typically required (potential violations if missing)
const VIOLATION_CLASSES = new Set(['no-helmet', 'no-vest', 'no-gloves', 'no-goggles', 'no-mask', 'person-no-ppe'])

interface Props {
  classCounts?: PpeClassCount[]
}

export default function ClassCountsTable({ classCounts: propClassCounts }: Props) {
  const { classCounts: storeClassCounts } = useJobStore()
  const data = propClassCounts ?? storeClassCounts

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
        }}
      >
        NO CLASS DATA AVAILABLE
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b.count - a.count)
  const maxCount = sorted[0]?.count ?? 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sorted.map((item) => {
        const pct = (item.count / maxCount) * 100
        const isViolation = VIOLATION_CLASSES.has(item.className.toLowerCase())
        const barColor = isViolation ? 'var(--amber)' : 'var(--cyan)'

        return (
          <div
            key={item.className}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 60px',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Class name */}
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: isViolation ? 'var(--amber)' : 'var(--text-secondary)',
                letterSpacing: '0.04em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={item.className}
            >
              {item.className}
            </div>

            {/* Bar */}
            <div
              style={{
                height: 6,
                background: 'var(--border)',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: barColor,
                  borderRadius: 3,
                  transition: 'width 0.6s ease',
                  boxShadow: `0 0 6px ${isViolation ? 'var(--amber-glow)' : 'var(--cyan-glow)'}`,
                }}
              />
            </div>

            {/* Count */}
            <div
              style={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: 13,
                fontWeight: 600,
                color: isViolation ? 'var(--amber)' : 'var(--text-primary)',
                textAlign: 'right',
              }}
            >
              {item.count.toLocaleString()}
            </div>
          </div>
        )
      })}
    </div>
  )
}
