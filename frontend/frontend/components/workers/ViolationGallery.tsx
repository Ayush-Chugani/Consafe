'use client'

import React, { useState } from 'react'
import type { ViolationFrame, Worker } from '@/api/types'
import ProofImageModal from './ProofImageModal'

interface Props {
  violations: ViolationFrame[]
  loading?: boolean
  worker?: Worker | null
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
        breakInside: 'avoid',
        marginBottom: 12,
      }}
    >
      <div style={{ height: 140, background: 'var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ height: 10, width: '60%', background: 'var(--border)', borderRadius: 3, marginBottom: 6 }} />
        <div style={{ height: 10, width: '40%', background: 'var(--border-dim, #1e2130)', borderRadius: 3 }} />
      </div>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  )
}

export default function ViolationGallery({ violations, loading, worker }: Props) {
  const [selected, setSelected] = useState<ViolationFrame | null>(null)

  if (loading) {
    return (
      <div style={{ columns: 3, gap: 12, columnGap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (violations.length === 0) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          background: 'var(--green-dim)',
          border: '1px solid var(--green)',
          borderRadius: 8,
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          color: 'var(--green)',
        }}
      >
        NO VIOLATIONS RECORDED
      </div>
    )
  }

  return (
    <>
      <div style={{ columns: 3, gap: 12, columnGap: 12 }}>
        {violations.map((frame) => {
          const missingList = frame.missingItems
            ? frame.missingItems.split(',').filter(Boolean)
            : []

          return (
            <div
              key={frame.id}
              onClick={() => setSelected(frame)}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                overflow: 'hidden',
                breakInside: 'avoid',
                marginBottom: 12,
                cursor: 'pointer',
                transition: 'border-color 0.2s, transform 0.15s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--amber)'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'none'
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img
                  src={frame.frameJpegUrl}
                  alt={`Violation frame ${frame.frameIndex}`}
                  loading="lazy"
                  style={{
                    width: '100%',
                    display: 'block',
                    objectFit: 'cover',
                  }}
                />
                {/* Bottom gradient overlay */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: '60%',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    pointerEvents: 'none',
                  }}
                />
                {/* Worker ID label */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8, left: 10,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  {frame.worker?.workerCode ?? `W${frame.workerId?.slice(0, 6) ?? '?'}`}
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '8px 10px' }}>
                {/* Missing PPE badges */}
                {missingList.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                    {missingList.map((item) => (
                      <span
                        key={item}
                        style={{
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: 'var(--amber-dim)',
                          border: '1px solid var(--amber)33',
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 8,
                          color: 'var(--amber)',
                        }}
                      >
                        {item.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div
                  style={{
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: 9,
                    color: 'var(--text-secondary)',
                    marginBottom: 3,
                  }}
                >
                  {new Date(frame.frameTimestamp * 1000).toISOString().substr(11, 8)}
                </div>

                {/* Job ref */}
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 8,
                    color: 'var(--text-muted)',
                  }}
                >
                  {frame.jobId.slice(0, 8)}…
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <ProofImageModal
        frame={selected}
        worker={worker ?? null}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </>
  )
}
