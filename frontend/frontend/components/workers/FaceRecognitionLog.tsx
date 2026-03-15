'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { workerService } from '@/api/services/workerService'
import type { FaceDetectionLog, MatchStatus } from '@/api/types'

interface Props {
  workerId: string
}

const MATCH_STATUS_CONFIG: Record<MatchStatus, { label: string; color: string; bg: string }> = {
  matched:       { label: 'MATCHED',        color: 'var(--green)',  bg: 'var(--green-dim)' },
  unmatched:     { label: 'UNMATCHED',      color: 'var(--red)',    bg: 'var(--red-dim)'   },
  false_positive:{ label: 'FALSE POSITIVE', color: 'var(--amber)',  bg: 'var(--amber-dim)' },
  flagged:       { label: 'FLAGGED',        color: 'var(--violet)', bg: 'var(--violet-dim)' },
}

const PAGE_SIZE = 20

export default function FaceRecognitionLog({ workerId }: Props) {
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['worker-face-log', workerId, page, startDate, endDate],
    queryFn: () =>
      workerService.getFaceLog(workerId, {
        page,
        limit: PAGE_SIZE,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    placeholderData: (prev) => prev,
  })

  const logs: FaceDetectionLog[] = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  const thStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    borderBottom: '1px solid var(--border)',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    background: 'var(--bg-elevated)',
  }

  return (
    <div>
      {/* Date filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>DATE RANGE</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
          style={{
            padding: '5px 10px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 5,
            color: 'var(--text-primary)', fontFamily: "'DM Mono', monospace", fontSize: 11,
            outline: 'none',
          }}
        />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>–</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
          style={{
            padding: '5px 10px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 5,
            color: 'var(--text-primary)', fontFamily: "'DM Mono', monospace", fontSize: 11,
            outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>TIMESTAMP</th>
              <th style={thStyle}>CAMERA</th>
              <th style={thStyle}>CONFIDENCE</th>
              <th style={thStyle}>STATUS</th>
              <th style={thStyle}>PROOF</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ height: 11, background: 'var(--border)', borderRadius: 3 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                  NO RECORDS FOUND
                </td>
              </tr>
            ) : (
              logs.map((log, i) => {
                const cfg = MATCH_STATUS_CONFIG[log.matchStatus]
                return (
                  <tr
                    key={log.id}
                    style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}
                    onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay, #1a2035)' }}
                    onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}
                  >
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', fontFamily: "'Roboto Mono', monospace", fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(log.detectedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--text-secondary)' }}>
                      {log.cameraId}
                    </td>
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', fontFamily: "'Roboto Mono', monospace", fontSize: 13, color: log.confidence >= 0.9 ? 'var(--green)' : log.confidence >= 0.7 ? 'var(--amber)' : 'var(--red)', fontWeight: 600 }}>
                      {(log.confidence * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{
                        padding: '2px 7px', borderRadius: 4,
                        background: cfg.bg, border: `1px solid ${cfg.color}33`,
                        fontFamily: "'DM Mono', monospace", fontSize: 9,
                        color: cfg.color, letterSpacing: '0.06em',
                      }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                      {log.frameJpegUrl ? (
                        <img
                          src={log.frameJpegUrl}
                          alt="proof"
                          style={{
                            width: 36, height: 36,
                            objectFit: 'cover',
                            borderRadius: 4,
                            border: '1px solid var(--border)',
                            cursor: 'pointer',
                          }}
                          onClick={() => window.open(log.frameJpegUrl, '_blank')}
                        />
                      ) : (
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '5px 12px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: 5,
              color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            PREV
          </button>
          <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 12, color: 'var(--text-secondary)' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '5px 12px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: 5,
              color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: page === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            NEXT
          </button>
        </div>
      )}
    </div>
  )
}
