'use client'
import { Film, AlertTriangle, Users, Activity } from 'lucide-react'
import type { AnalysisResponse } from '@/api/types'

interface Props { result: AnalysisResponse }

const card = (
  label: string,
  value: number,
  icon: React.ReactNode,
  color: string,
  glow: string,
  sub?: string,
) => (
  <div
    key={label}
    style={{
      background: 'var(--bg-surface)',
      border: `1px solid var(--border)`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 10,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      boxShadow: `0 0 24px ${glow}`,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color, opacity: 0.8 }}>{icon}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
      {value.toLocaleString()}
    </p>
    {sub && (
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
        {sub}
      </p>
    )}
  </div>
)

export default function AnalysisKpiCards({ result }: Props) {
  const pct = result.frames_done > 0
    ? `${((result.missing_frames / result.frames_done) * 100).toFixed(1)}% of frames affected`
    : undefined

  return (
    <div
      data-reveal=""
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}
    >
      {card('Processed Frames',       result.frames_done,            <Film size={14} />,          'var(--cyan)',   'rgba(0,212,255,0.06)')}
      {card('Frames With Missing PPE', result.missing_frames,         <AlertTriangle size={14} />, 'var(--amber)',  'rgba(245,158,11,0.06)', pct)}
      {card('Workers Tracked',         result.total_workers_tracked,  <Users size={14} />,         'var(--cyan)',   'rgba(0,212,255,0.06)')}
      {card('Peak People In Frame',    result.max_people,             <Activity size={14} />,      'var(--violet)', 'rgba(167,139,250,0.10)')}
    </div>
  )
}
