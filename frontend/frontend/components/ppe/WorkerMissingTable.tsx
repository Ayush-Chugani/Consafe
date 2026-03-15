'use client'
import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { WorkerRow } from '@/api/types'

interface Props { rows: WorkerRow[] }
type SortKey = keyof WorkerRow
type SortDir = 'asc' | 'desc'

function MissingBadges({ items }: { items: string }) {
  if (!items.trim()) {
    return (
      <span style={{ padding: '2px 8px', borderRadius: 4, background: 'var(--green-dim)', border: '1px solid rgba(0,229,160,0.3)', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)', letterSpacing: '0.06em' }}>
        COMPLIANT
      </span>
    )
  }
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {items.split(',').map((i) => i.trim()).filter(Boolean).map((item) => (
        <span key={item} style={{ padding: '2px 7px', borderRadius: 4, background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.3)', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', whiteSpace: 'nowrap' }}>
          {item}
        </span>
      ))}
    </div>
  )
}

export default function WorkerMissingTable({ rows }: Props) {
  const [search, setSearch]     = useState('')
  const [sortKey, setSortKey]   = useState<SortKey>('missing_events')
  const [sortDir, setSortDir]   = useState<SortDir>('desc')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const data = rows.filter((r) => r.worker.toLowerCase().includes(q))
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, search, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const th = (label: string, key: SortKey) => (
    <th
      key={key}
      onClick={() => toggleSort(key)}
      style={{ padding: '10px 14px', background: 'var(--bg-elevated)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textAlign: 'left', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        {sortKey === key
          ? (sortDir === 'asc' ? <ChevronUp size={10} style={{ color: 'var(--cyan)' }} /> : <ChevronDown size={10} style={{ color: 'var(--cyan)' }} />)
          : <ChevronDown size={10} style={{ opacity: 0.3 }} />}
      </span>
    </th>
  )

  if (!rows.length) {
    return <div style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>No worker tracking data available.</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search workers…"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, padding: '8px 12px', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--cyan-border)'; e.target.style.boxShadow = '0 0 0 3px var(--cyan-dim)' }}
        onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
      />

      {filtered.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>No workers match your search.</div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {th('WORKER', 'worker')}
                {th('MISSING PPE', 'missing_items')}
                {th('FRAMES SEEN', 'frames_seen')}
                {th('MISSING EVENTS', 'missing_events')}
                <th style={{ padding: '10px 14px', background: 'var(--bg-elevated)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>COMPLIANCE</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={row.worker}
                  style={{
                    background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)',
                    borderLeft: row.missing_events > 10 ? '3px solid rgba(255,77,106,0.6)' : '3px solid transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}
                >
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, borderBottom: '1px solid var(--border-dim)' }}>{row.worker}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-dim)' }}><MissingBadges items={row.missing_items} /></td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', borderBottom: '1px solid var(--border-dim)' }}>{row.frames_seen.toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: row.missing_events > 0 ? 'var(--red)' : 'var(--green)', fontVariantNumeric: 'tabular-nums', fontWeight: 700, borderBottom: '1px solid var(--border-dim)' }}>{row.missing_events}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-dim)' }}>
                    {row.missing_items.trim()
                      ? <span style={{ fontSize: 11, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{((1 - row.missing_events / Math.max(row.frames_seen, 1)) * 100).toFixed(0)}%</span>
                      : <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>100%</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
