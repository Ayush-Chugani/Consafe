'use client'

import React, { useState, useMemo } from 'react'
import { Download, ChevronUp, ChevronDown, Eye } from 'lucide-react'
import { useJobStore } from '@/store/jobStore'
import type { WorkerPpeSummary } from '@/api/types'

type SortKey = 'workerLabel' | 'framesSeen' | 'missingEvents'
type SortDir = 'asc' | 'desc'

interface Props {
  workerSummary?: WorkerPpeSummary[]
}

function MissingBadge({ item }: { item: string }) {
  return (
    <span
      style={{
        padding: '2px 6px',
        borderRadius: 3,
        background: 'var(--amber-dim)',
        border: '1px solid var(--amber)33',
        fontFamily: "'DM Mono', monospace",
        fontSize: 9,
        color: 'var(--amber)',
        whiteSpace: 'nowrap',
      }}
    >
      {item.trim()}
    </span>
  )
}

export default function WorkerSummaryTable({ workerSummary: propData }: Props) {
  const { workerSummary: storeData } = useJobStore()
  const data = propData ?? storeData

  const [sortKey, setSortKey] = useState<SortKey>('missingEvents')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let va: string | number = a[sortKey]
      let vb: string | number = b[sortKey]
      if (sortDir === 'asc') return va < vb ? -1 : va > vb ? 1 : 0
      return va > vb ? -1 : va < vb ? 1 : 0
    })
  }, [data, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  function exportCSV() {
    const header = 'Worker Label,Frames Seen,Missing Events,Missing Items'
    const rows = sorted.map((r) =>
      `"${r.workerLabel}",${r.framesSeen},${r.missingEvents},"${r.missingItems}"`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'worker_summary.csv'
    a.click(); URL.revokeObjectURL(url)
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown size={12} style={{ opacity: 0.3 }} />
    return sortDir === 'asc'
      ? <ChevronUp   size={12} style={{ color: 'var(--cyan)' }} />
      : <ChevronDown size={12} style={{ color: 'var(--cyan)' }} />
  }

  const colStyle: React.CSSProperties = {
    padding: '10px 14px',
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  }

  if (data.length === 0) {
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
        NO WORKER DATA AVAILABLE
      </div>
    )
  }

  return (
    <div>
      {/* Export button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          onClick={exportCSV}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--cyan)',
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
        >
          <Download size={12} />
          EXPORT CSV
        </button>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)' }}>
              <th style={colStyle} onClick={() => toggleSort('workerLabel')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  WORKER LABEL <SortIcon col="workerLabel" />
                </div>
              </th>
              <th style={colStyle} onClick={() => toggleSort('framesSeen')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  FRAMES SEEN <SortIcon col="framesSeen" />
                </div>
              </th>
              <th style={colStyle} onClick={() => toggleSort('missingEvents')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  MISSING EVENTS <SortIcon col="missingEvents" />
                </div>
              </th>
              <th style={colStyle}>MISSING ITEMS</th>
              <th style={colStyle}>FRAMES</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const missingList = row.missingItems
                ? row.missingItems.split(',').filter(Boolean)
                : []
              return (
                <tr
                  key={row.id}
                  style={{
                    background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay, #1a2035)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)')}
                >
                  <td
                    style={{
                      padding: '10px 14px',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                      fontWeight: 600,
                    }}
                  >
                    {row.workerLabel}
                  </td>
                  <td
                    style={{
                      padding: '10px 14px',
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: 13,
                      color: 'var(--cyan)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {row.framesSeen.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: '10px 14px',
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: 13,
                      color: row.missingEvents > 0 ? 'var(--red)' : 'var(--green)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {row.missingEvents.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: '8px 14px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {missingList.length > 0
                        ? missingList.map((item) => <MissingBadge key={item} item={item} />)
                        : <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--green)' }}>Compliant</span>
                      }
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '8px 14px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <button
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: 5,
                        color: 'var(--text-secondary)',
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 10,
                        cursor: 'pointer',
                      }}
                    >
                      <Eye size={11} />
                      VIEW
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
