'use client'
import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { SafetyRow } from '@/api/types'

interface Props { rows: SafetyRow[] }
type SortKey = keyof SafetyRow
type SortDir = 'asc' | 'desc'

const RISK_COLOR: Record<SafetyRow['risk_level'], string> = {
  Low: 'var(--green)', Medium: 'var(--amber)', High: 'var(--red)',
}
const RISK_DIM: Record<SafetyRow['risk_level'], string> = {
  Low: 'var(--green-dim)', Medium: 'var(--amber-dim)', High: 'var(--red-dim)',
}

export default function SafetyRankingTable({ rows }: Props) {
  const [search, setSearch]   = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    const q = search.toLowerCase()
    const data = rows.filter((r) => r.worker.toLowerCase().includes(q))
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, search, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    key === sortKey ? setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')) : (setSortKey(key), setSortDir('desc'))
  }

  const thBase: React.CSSProperties = { padding: '10px 12px', background: 'var(--bg-elevated)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textAlign: 'left', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }

  const Th = ({ label, skey }: { label: string; skey: SortKey }) => (
    <th style={thBase} onClick={() => toggleSort(skey)}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
        {label}
        {sortKey === skey
          ? sortDir === 'asc' ? <ChevronUp size={9} style={{ color: 'var(--cyan)' }} /> : <ChevronDown size={9} style={{ color: 'var(--cyan)' }} />
          : <ChevronDown size={9} style={{ opacity: 0.3 }} />}
      </span>
    </th>
  )

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

      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thBase, cursor: 'default' }}>#</th>
              <Th label="WORKER" skey="worker" />
              <Th label="SCORE" skey="score" />
              <Th label="VIOLATIONS" skey="violations" />
              <Th label="LATE" skey="late_arrivals" />
              <Th label="ABSENCE" skey="absence" />
              <Th label="BONUS" skey="compliance_bonus" />
              <Th label="RISK" skey="risk_level" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>No workers match your search.</td></tr>
            ) : sorted.map((row, i) => (
              <tr
                key={row.worker}
                style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)', transition: 'background 0.1s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}
              >
                <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', borderBottom: '1px solid var(--border-dim)' }}>{i + 1}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, borderBottom: '1px solid var(--border-dim)' }}>{row.worker}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-dim)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 60, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${row.score}%`, height: '100%', background: RISK_COLOR[row.risk_level], borderRadius: 2, transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: RISK_COLOR[row.risk_level], fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{row.score}</span>
                  </div>
                </td>
                {[row.violations, row.late_arrivals, row.absence, row.compliance_bonus].map((v, ci) => (
                  <td key={ci} style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: v > 0 && ci < 3 ? (ci === 3 ? 'var(--green)' : 'var(--amber)') : 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', borderBottom: '1px solid var(--border-dim)' }}>{v}</td>
                ))}
                <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-dim)' }}>
                  <span style={{ padding: '3px 8px', borderRadius: 4, background: RISK_DIM[row.risk_level], border: `1px solid ${RISK_COLOR[row.risk_level]}44`, fontFamily: 'var(--font-mono)', fontSize: 9, color: RISK_COLOR[row.risk_level], letterSpacing: '0.06em' }}>
                    {row.risk_level.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', textAlign: 'right' }}>
        score = 100 − (violations × 3) − (late_arrivals × 2) − (absence × 5) + compliance_bonus
      </p>
    </div>
  )
}
