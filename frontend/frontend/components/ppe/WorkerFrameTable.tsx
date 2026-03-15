'use client'

import React from 'react'
import type { ViolationFrame } from '@/api/types'

interface Props {
  violationFrames?: ViolationFrame[]
}

export default function WorkerFrameTable({ violationFrames: propData }: Props) {
  const data = propData ?? []

  const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    borderBottom: '1px solid var(--border)',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    background: 'var(--bg-elevated)',
  }

  if (!data || data.length === 0) {
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
        NO VIOLATION FRAMES RECORDED
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>FRAME</th>
            <th style={thStyle}>TIMESTAMP</th>
            <th style={thStyle}>WORKER</th>
            <th style={thStyle}>MISSING PPE</th>
            <th style={thStyle}>CONFIDENCE</th>
            <th style={thStyle}>PREVIEW</th>
          </tr>
        </thead>
        <tbody>
          {data.map((frame, i) => {
            const missingList = frame.missingItems
              ? frame.missingItems.split(',').filter(Boolean)
              : []
            return (
              <tr
                key={frame.id}
                style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay, #1a2035)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)')}
              >
                <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: "'Roboto Mono', monospace", fontSize: 12, color: 'var(--cyan)' }}>
                  #{frame.frameIndex.toLocaleString()}
                </td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: "'Roboto Mono', monospace", fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {new Date(frame.frameTimestamp * 1000).toISOString().substr(11, 8)}
                </td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--text-secondary)' }}>
                  {frame.workerId?.slice(0, 8) ?? '—'}
                </td>
                <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {missingList.length > 0 ? missingList.map((item) => (
                      <span
                        key={item}
                        style={{
                          padding: '2px 6px', borderRadius: 3,
                          background: 'var(--amber-dim)', border: '1px solid var(--amber)33',
                          fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'var(--amber)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.trim()}
                      </span>
                    )) : (
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--green)' }}>Compliant</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: "'Roboto Mono', monospace", fontSize: 12, color: frame.confidenceScore != null && frame.confidenceScore >= 0.9 ? 'var(--green)' : 'var(--amber)' }}>
                  {frame.confidenceScore != null ? `${(frame.confidenceScore * 100).toFixed(1)}%` : '—'}
                </td>
                <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                  {frame.frameJpegUrl ? (
                    <img
                      src={frame.frameJpegUrl}
                      alt={`Frame ${frame.frameIndex}`}
                      style={{
                        width: 48, height: 36,
                        objectFit: 'cover',
                        borderRadius: 4,
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                      onClick={() => window.open(frame.frameJpegUrl, '_blank')}
                    />
                  ) : (
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
