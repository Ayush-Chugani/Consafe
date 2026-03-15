'use client'

import React from 'react'
import { Edit3, History, FileText } from 'lucide-react'
import type { Worker, AttendanceRecord } from '@/api/types'

interface Props {
  worker: Worker
  attendanceToday?: AttendanceRecord | null
}

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function ProgressRing({
  score, size = 120, strokeWidth = 8,
}: {
  score: number; size?: number; strokeWidth?: number
}) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(score, 100))
  const offset = circ - (pct / 100) * circ

  const color =
    score >= 90 ? 'var(--green)' :
    score >= 75 ? 'var(--cyan)' :
    score >= 60 ? 'var(--amber)' :
    'var(--red)'

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 22,
            fontWeight: 700,
            color,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 8,
            color: 'var(--text-muted)',
            marginTop: 2,
          }}
        >
          SCORE
        </span>
      </div>
    </div>
  )
}

const ACTION_BUTTONS = [
  { icon: Edit3,   label: 'Edit Worker',      color: 'var(--cyan)' },
  { icon: History, label: 'View Full History', color: 'var(--violet)' },
  { icon: FileText,label: 'Export Report',     color: 'var(--amber)' },
]

export default function WorkerHero({ worker, attendanceToday }: Props) {
  const isActive = worker.isActive
  const statusColor = isActive ? 'var(--green)' : 'var(--red)'
  const statusLabel = isActive ? 'ACTIVE' : 'INACTIVE'

  return (
    <div
      data-reveal
      style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '28px 28px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: -40, left: -40,
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'var(--cyan-dim)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {worker.referencePhotoUrl ? (
            <img
              src={worker.referencePhotoUrl}
              alt={worker.name}
              style={{
                width: 72, height: 72,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${statusColor}`,
                boxShadow: `0 0 20px ${isActive ? 'var(--green-glow)' : 'var(--red-glow)'}`,
              }}
            />
          ) : (
            <div
              style={{
                width: 72, height: 72,
                borderRadius: '50%',
                background: 'var(--bg-overlay, #1a2035)',
                border: `3px solid ${statusColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Syne', sans-serif",
                fontSize: 22, fontWeight: 700,
                color: 'var(--text-primary)',
                boxShadow: `0 0 20px ${isActive ? 'var(--green-glow)' : 'var(--red-glow)'}`,
              }}
            >
              {initials(worker.name)}
            </div>
          )}
          {/* Status dot */}
          <div
            style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 14, height: 14, borderRadius: '50%',
              background: statusColor,
              border: '2px solid var(--bg-surface)',
            }}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 28, fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 6,
            }}
          >
            {worker.name}
          </h1>

          {/* Meta row */}
          <div
            style={{
              display: 'flex',
              gap: 0,
              flexWrap: 'wrap',
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginBottom: 12,
            }}
          >
            {[
              worker.workerCode,
              worker.department,
              worker.jobTitle,
              worker.siteLocation,
            ].map((item, i, arr) => (
              <React.Fragment key={i}>
                <span>{item}</span>
                {i < arr.length - 1 && (
                  <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>|</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Status badge */}
          <div
            style={{
              display: 'inline-flex',
              padding: '3px 10px',
              borderRadius: 4,
              background: isActive ? 'var(--green-dim)' : 'var(--red-dim)',
              border: `1px solid ${statusColor}33`,
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              color: statusColor,
              letterSpacing: '0.1em',
              marginBottom: 16,
            }}
          >
            {statusLabel}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {ACTION_BUTTONS.map(({ icon: Icon, label, color }) => (
              <button
                key={label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 7,
                  color: color,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => { ;(e.currentTarget as HTMLButtonElement).style.borderColor = color }}
                onMouseLeave={(e) => { ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Safety score ring */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <ProgressRing score={worker.safetyScore} size={120} />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
            }}
          >
            SAFETY SCORE
          </span>
        </div>
      </div>

      {/* Today's attendance strip */}
      {attendanceToday && (
        <div
          style={{
            marginTop: 20,
            padding: '10px 16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            display: 'flex',
            gap: 20,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
            TODAY
          </span>
          <span
            style={{
              padding: '2px 8px', borderRadius: 4,
              background: attendanceToday.status === 'present' ? 'var(--green-dim)' : 'var(--amber-dim)',
              fontFamily: "'DM Mono', monospace", fontSize: 9,
              color: attendanceToday.status === 'present' ? 'var(--green)' : 'var(--amber)',
              textTransform: 'uppercase',
            }}
          >
            {attendanceToday.status}
          </span>
          {attendanceToday.clockInTime && (
            <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 12, color: 'var(--text-secondary)' }}>
              In: {new Date(attendanceToday.clockInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {attendanceToday.clockOutTime && (
            <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 12, color: 'var(--text-secondary)' }}>
              Out: {new Date(attendanceToday.clockOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
