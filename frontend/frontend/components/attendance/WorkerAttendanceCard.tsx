'use client'

import React from 'react'
import { Clock, UserCheck } from 'lucide-react'
import type { AttendanceRecord, AttendanceStatus } from '@/api/types'

interface Worker {
  id: string
  name: string
  workerCode: string
  department: string
  referencePhotoUrl: string | null
}

interface Props {
  record: AttendanceRecord & { worker?: Worker }
  onViewProof: () => void
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  present:  { label: 'PRESENT',  color: 'var(--green)',  bg: 'var(--green-dim)' },
  absent:   { label: 'ABSENT',   color: 'var(--red)',    bg: 'var(--red-dim)'   },
  late:     { label: 'LATE',     color: 'var(--amber)',  bg: 'var(--amber-dim)' },
  on_leave: { label: 'ON LEAVE', color: '#60a5fa',       bg: 'rgba(96,165,250,0.10)' },
}

function formatTime(iso: string | null): string {
  if (!iso) return '--'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export default function WorkerAttendanceCard({ record, onViewProof }: Props) {
  const worker = record.worker
  const cfg    = STATUS_CONFIG[record.status]

  return (
    <div
      data-reveal
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '16px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 180,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-bright)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
    >
      {/* Avatar + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {worker?.referencePhotoUrl ? (
            <img
              src={worker.referencePhotoUrl}
              alt={worker.name}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${cfg.color}`,
              }}
            />
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--bg-overlay, #1a2035)',
                border: `2px solid ${cfg.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Syne', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: cfg.color,
              }}
            >
              {worker ? initials(worker.name) : '??'}
            </div>
          )}
          {/* Status dot */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: cfg.color,
              border: '2px solid var(--bg-elevated)',
            }}
          />
        </div>

        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {worker?.name ?? 'Unknown Worker'}
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: 'var(--text-muted)',
              marginTop: 2,
            }}
          >
            {worker?.workerCode ?? '—'}
          </div>
        </div>
      </div>

      {/* Status badge */}
      <div
        style={{
          display: 'inline-flex',
          alignSelf: 'flex-start',
          padding: '2px 8px',
          borderRadius: 4,
          background: cfg.bg,
          border: `1px solid ${cfg.color}33`,
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          fontWeight: 600,
          color: cfg.color,
          letterSpacing: '0.08em',
        }}
      >
        {cfg.label}
      </div>

      {/* Clock times */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-secondary)' }}>IN</span>
          <span
            style={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: 12,
              color: record.clockInTime ? 'var(--green)' : 'var(--text-muted)',
              marginLeft: 'auto',
            }}
          >
            {formatTime(record.clockInTime)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-secondary)' }}>OUT</span>
          <span
            style={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: 12,
              color: record.clockOutTime ? 'var(--cyan)' : 'var(--text-muted)',
              marginLeft: 'auto',
            }}
          >
            {formatTime(record.clockOutTime)}
          </span>
        </div>
      </div>

      {/* Confidence */}
      {record.clockInConfidence != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <UserCheck size={11} style={{ color: 'var(--green)' }} />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: 'var(--green)',
            }}
          >
            {(record.clockInConfidence * 100).toFixed(1)}% match
          </span>
        </div>
      )}

      {/* View Proof button */}
      <button
        onClick={onViewProof}
        style={{
          marginTop: 'auto',
          padding: '6px 12px',
          borderRadius: 6,
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--cyan)',
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.06em',
          cursor: 'pointer',
          transition: 'border-color 0.2s, background 0.2s',
          width: '100%',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--cyan)'
          ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--cyan-dim)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }}
      >
        VIEW PROOF
      </button>
    </div>
  )
}
