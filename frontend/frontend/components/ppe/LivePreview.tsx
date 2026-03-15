'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useJobStore } from '@/store/jobStore'

function FpsCounter({ frameIndex }: { frameIndex: number }) {
  const prevRef = useRef({ index: frameIndex, time: Date.now() })
  const [fps, setFps] = useState(0)

  useEffect(() => {
    const now = Date.now()
    const dt = (now - prevRef.current.time) / 1000
    const dFrames = frameIndex - prevRef.current.index
    if (dt > 0 && dFrames > 0) {
      setFps(Math.round(dFrames / dt))
    }
    prevRef.current = { index: frameIndex, time: now }
  }, [frameIndex])

  return (
    <span
      style={{
        fontFamily: "'Roboto Mono', monospace",
        fontSize: 11,
        color: 'var(--text-secondary)',
      }}
    >
      {fps} FPS
    </span>
  )
}

function ScanAnimation() {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '16/9',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(245,197,24,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,197,24,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Scan line */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)',
          animation: 'scanLine 2s ease-in-out infinite',
        }}
      />
      <div
        style={{
          textAlign: 'center',
          zIndex: 1,
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        AWAITING FRAME DATA
      </div>
      <style>{`
        @keyframes scanLine {
          0%   { top: 0; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0; }
        }
      `}</style>
    </div>
  )
}

export default function LivePreview() {
  const { currentFrameData, frameIndex, workersInFrame, appState } = useJobStore()
  const isRunning = appState === 'RUNNING'

  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isRunning && (
            <div
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--green)',
                animation: 'pulseDot 2s ease infinite',
              }}
            />
          )}
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: 'var(--text-primary)',
              letterSpacing: '0.08em',
            }}
          >
            LIVE PREVIEW
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {frameIndex > 0 && (
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: 'var(--text-muted)',
              }}
            >
              FRAME #{frameIndex.toLocaleString()}
            </span>
          )}
          {currentFrameData && <FpsCounter frameIndex={frameIndex} />}
        </div>
      </div>

      {/* Frame image */}
      <div style={{ padding: 12 }}>
        {currentFrameData ? (
          <img
            src={`data:image/jpeg;base64,${currentFrameData}`}
            alt="Live frame"
            style={{
              width: '100%',
              borderRadius: 6,
              display: 'block',
              objectFit: 'contain',
            }}
          />
        ) : (
          <ScanAnimation />
        )}
      </div>

      {/* Workers in frame */}
      {workersInFrame.length > 0 && (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            padding: '10px 16px',
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: 'var(--text-muted)',
              marginBottom: 8,
              letterSpacing: '0.06em',
            }}
          >
            WORKERS IN FRAME ({workersInFrame.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {workersInFrame.map((w) => (
              <div
                key={w.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 10px',
                  background: 'var(--bg-surface)',
                  borderRadius: 5,
                  border: `1px solid ${w.compliant ? 'var(--green)' : 'var(--red)'}22`,
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: w.compliant ? 'var(--green)' : 'var(--red)',
                  }}
                >
                  {w.id}
                </span>
                {!w.compliant && w.missing_items.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {w.missing_items.map((item) => (
                      <span
                        key={item}
                        style={{
                          padding: '1px 6px',
                          borderRadius: 3,
                          background: 'var(--amber-dim)',
                          border: '1px solid var(--amber)33',
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 9,
                          color: 'var(--amber)',
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
