'use client'

import React, { useEffect, useState } from 'react'
import { useJobStore } from '@/store/jobStore'

type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'UPLOADING' | 'IDLE'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  IDLE:       { label: 'IDLE',       color: 'var(--text-muted)',  bg: 'rgba(66,74,94,0.2)' },
  UPLOADING:  { label: 'UPLOADING',  color: 'var(--violet)',      bg: 'var(--violet-dim)'  },
  QUEUED:     { label: 'QUEUED',     color: 'var(--amber)',       bg: 'var(--amber-dim)'   },
  RUNNING:    { label: 'PROCESSING', color: 'var(--cyan)',        bg: 'var(--cyan-dim)'    },
  COMPLETED:  { label: 'COMPLETED',  color: 'var(--green)',       bg: 'var(--green-dim)'   },
  FAILED:     { label: 'FAILED',     color: 'var(--red)',         bg: 'var(--red-dim)'     },
}

function useElapsedTime(running: boolean): string {
  const [elapsed, setElapsed] = useState(0)
  const startRef = React.useRef<number>(Date.now())

  useEffect(() => {
    if (!running) { setElapsed(0); startRef.current = Date.now(); return }
    startRef.current = Date.now()
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(id)
  }, [running])

  const m = Math.floor(elapsed / 60).toString().padStart(2, '0')
  const s = (elapsed % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function ProgressBar() {
  const { appState, progress, processedFrames, totalFrames } = useJobStore()
  const status = appState as JobStatus
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.IDLE
  const isRunning = status === 'RUNNING'
  const elapsed = useElapsedTime(isRunning)

  const pct = Math.min(Math.max(progress, 0), 100)

  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '16px 20px',
      }}
    >
      {/* Top row: status badge + elapsed */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 4,
            background: cfg.bg,
            border: `1px solid ${cfg.color}33`,
          }}
        >
          {isRunning && (
            <div
              style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: cfg.color,
                animation: 'pulseDot 2s ease infinite',
              }}
            />
          )}
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: cfg.color,
              letterSpacing: '0.08em',
            }}
          >
            {cfg.label}
          </span>
        </div>

        {isRunning && (
          <span
            style={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}
          >
            {elapsed}
          </span>
        )}
      </div>

      {/* Progress track */}
      <div
        style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          background: 'var(--border)',
          overflow: 'hidden',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: status === 'FAILED' ? 'var(--red)' : status === 'COMPLETED' ? 'var(--green)' : 'var(--cyan)',
            borderRadius: 3,
            transition: 'width 0.4s ease',
            boxShadow: isRunning ? '0 0 8px var(--cyan-glow)' : 'none',
            position: 'relative',
            overflow: isRunning ? 'hidden' : undefined,
          }}
        >
          {isRunning && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* Bottom row: % + frames */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 20,
            fontWeight: 700,
            color: cfg.color,
          }}
        >
          {pct.toFixed(1)}%
        </span>

        {totalFrames > 0 && (
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: 'var(--text-secondary)',
            }}
          >
            {processedFrames.toLocaleString()} / {totalFrames.toLocaleString()} frames
          </span>
        )}
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
