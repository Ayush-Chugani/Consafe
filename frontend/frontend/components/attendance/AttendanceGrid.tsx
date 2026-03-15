'use client'

import React, { useState } from 'react'
import type { AttendanceRecord } from '@/api/types'
import WorkerAttendanceCard from './WorkerAttendanceCard'
import FaceProofModal from './FaceProofModal'

interface Props {
  records: AttendanceRecord[]
  loading?: boolean
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '16px 14px',
        minHeight: 200,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      {/* Avatar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div
          style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--border)', flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ height: 12, width: '70%', background: 'var(--border)', borderRadius: 4, marginBottom: 6 }} />
          <div style={{ height: 10, width: '40%', background: 'var(--border-dim, #1e2130)', borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ height: 20, width: '50%', background: 'var(--border)', borderRadius: 4, marginBottom: 12 }} />
      <div style={{ height: 10, width: '80%', background: 'var(--border-dim, #1e2130)', borderRadius: 4, marginBottom: 6 }} />
      <div style={{ height: 10, width: '80%', background: 'var(--border-dim, #1e2130)', borderRadius: 4, marginBottom: 12 }} />
      <div style={{ height: 30, background: 'var(--border)', borderRadius: 6, marginTop: 8 }} />
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

export default function AttendanceGrid({ records, loading }: Props) {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)',
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
        }}
      >
        NO ATTENDANCE RECORDS FOUND
      </div>
    )
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        {records.map((record) => (
          <WorkerAttendanceCard
            key={record.id}
            record={record}
            onViewProof={() => setSelectedRecord(record)}
          />
        ))}
      </div>

      <FaceProofModal
        record={selectedRecord as (AttendanceRecord & { worker: { id: string; name: string; workerCode: string; department: string; referencePhotoUrl: string | null } }) | null}
        open={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
      />
    </>
  )
}
