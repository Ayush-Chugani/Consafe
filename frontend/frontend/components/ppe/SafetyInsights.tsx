'use client'
import type { SafetyRow } from '@/api/types'

interface Props { rows: SafetyRow[] }

const RISK_COLOR: Record<SafetyRow['risk_level'], string> = {
  Low: 'var(--green)', Medium: 'var(--amber)', High: 'var(--red)',
}
const RISK_DIM: Record<SafetyRow['risk_level'], string> = {
  Low: 'var(--green-dim)', Medium: 'var(--amber-dim)', High: 'var(--red-dim)',
}

function ScoreRing({ score, risk }: { score: number; risk: SafetyRow['risk_level'] }) {
  const r = 16, circ = 2 * Math.PI * r
  const offset = ((100 - score) / 100) * circ
  const color = RISK_COLOR[risk]
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <circle cx={20} cy={20} r={r} fill="none" stroke="var(--border)" strokeWidth={3} />
      <circle cx={20} cy={20} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x={20} y={24} textAnchor="middle" fill={color} fontSize={9} fontFamily="'Roboto Mono', monospace" fontWeight={700}>
        {score}
      </text>
    </svg>
  )
}

function WorkerCard({ row, rank }: { row: SafetyRow; rank: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      background: 'var(--bg-elevated)', border: `1px solid var(--border)`,
      borderLeft: `3px solid ${RISK_COLOR[row.risk_level]}`,
      borderRadius: 8, marginBottom: 8,
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', minWidth: 18 }}>#{rank}</span>
      <ScoreRing score={row.score} risk={row.risk_level} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.worker}</p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
          {row.violations} violations · {row.absence} absent · {row.late_arrivals} late
        </p>
      </div>
      <span style={{
        padding: '3px 8px', borderRadius: 4,
        background: RISK_DIM[row.risk_level], border: `1px solid ${RISK_COLOR[row.risk_level]}44`,
        fontFamily: 'var(--font-mono)', fontSize: 9, color: RISK_COLOR[row.risk_level], letterSpacing: '0.08em',
        flexShrink: 0,
      }}>
        {row.risk_level.toUpperCase()} RISK
      </span>
    </div>
  )
}

export default function SafetyInsights({ rows }: Props) {
  const safe   = [...rows].filter((r) => r.risk_level === 'Low').sort((a, b) => b.score - a.score).slice(0, 5)
  const atRisk = [...rows].filter((r) => r.risk_level !== 'Low').sort((a, b) => a.score - b.score).slice(0, 5)

  const colHead = (label: string, color: string, count: number) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${color}33` }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color, letterSpacing: '0.08em', fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{count} workers</span>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Top Safe */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 16px' }}>
        {colHead('TOP SAFE WORKERS', 'var(--green)', safe.length)}
        {safe.length === 0
          ? <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', padding: '20px 0' }}>No low-risk workers yet</p>
          : safe.map((r, i) => <WorkerCard key={r.worker} row={r} rank={i + 1} />)}
      </div>

      {/* At Risk */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 16px' }}>
        {colHead('WORKERS AT RISK', 'var(--red)', atRisk.length)}
        {atRisk.length === 0
          ? <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', padding: '20px 0' }}>All workers are safe</p>
          : atRisk.map((r, i) => <WorkerCard key={r.worker} row={r} rank={i + 1} />)}
      </div>
    </div>
  )
}
