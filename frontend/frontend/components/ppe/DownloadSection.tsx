'use client'

import React from 'react'
import { Download, CheckCircle2 } from 'lucide-react'
import { useJobStore } from '@/store/jobStore'
import { jobService } from '@/api/services/jobService'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export default function DownloadSection() {
  const { appState, jobId, fileName, fileSize, processedFrames } = useJobStore()

  if (appState !== 'COMPLETED' || !jobId) return null

  const handleDownload = () => {
    const url = jobService.getDownloadUrl(jobId)
    window.open(url, '_blank')
  }

  return (
    <div
      data-reveal
      style={{
        background: 'var(--green-dim)',
        border: '1px solid var(--green)',
        borderRadius: 10,
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 56, height: 56,
          borderRadius: 10,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 16px var(--green-glow)',
        }}
      >
        <CheckCircle2 size={28} style={{ color: 'var(--green)' }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--green)',
            marginBottom: 4,
          }}
        >
          ANALYSIS COMPLETE
        </div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: 'var(--text-secondary)',
            marginBottom: 2,
          }}
        >
          {fileName || 'Processed video'}
        </div>
        <div
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          {processedFrames.toLocaleString()} frames analyzed
          {fileSize > 0 && ` · ${formatBytes(fileSize)}`}
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 24px',
          background: 'var(--green)',
          border: 'none',
          borderRadius: 8,
          color: '#000',
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.08em',
          cursor: 'pointer',
          boxShadow: '0 0 20px var(--green-glow)',
          transition: 'box-shadow 0.2s, transform 0.1s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px var(--green-glow)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px var(--green-glow)'
        }}
      >
        <Download size={16} />
        DOWNLOAD ANNOTATED VIDEO
      </button>
    </div>
  )
}
