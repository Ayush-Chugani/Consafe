'use client'

import React, { useCallback } from 'react'
import { Upload, X, Film } from 'lucide-react'
import { useJobStore } from '@/store/jobStore'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export default function UploadPanel() {
  const { file, setFile, clearFile } = useJobStore()
  const [isDragging, setIsDragging] = React.useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped && dropped.type.startsWith('video/')) {
        setFile(dropped)
      }
    },
    [setFile]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && f.type.startsWith('video/')) setFile(f)
  }

  if (file) {
    return (
      <div
        style={{
          border: '1px solid var(--green)',
          borderRadius: 10,
          background: 'var(--green-dim)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 44, height: 44,
            borderRadius: 8,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Film size={22} style={{ color: 'var(--green)' }} />
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: 'var(--text-primary)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {file.name}
          </div>
          <div
            style={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: 11,
              color: 'var(--text-secondary)',
              marginTop: 3,
            }}
          >
            {formatBytes(file.size)} · {file.type}
          </div>
        </div>

        <button
          onClick={clearFile}
          title="Remove file"
          style={{
            background: 'transparent',
            border: '1px solid var(--red)',
            borderRadius: 6,
            padding: 6,
            cursor: 'pointer',
            color: 'var(--red)',
            display: 'flex', alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{
        border: `2px dashed ${isDragging ? 'var(--cyan)' : 'var(--border)'}`,
        borderRadius: 10,
        padding: '48px 24px',
        background: isDragging ? 'var(--cyan-dim)' : 'var(--bg-elevated)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        transition: 'border-color 0.2s, background 0.2s',
        cursor: 'pointer',
      }}
      onClick={() => document.getElementById('ppe-file-input')?.click()}
    >
      <div
        style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: isDragging ? 'rgba(245,197,24,0.12)' : 'var(--bg-surface)',
          border: `1px solid ${isDragging ? 'var(--cyan)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        <Upload size={24} style={{ color: isDragging ? 'var(--cyan)' : 'var(--text-secondary)' }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 14,
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}
        >
          Drop video file here
        </div>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: 'var(--cyan)',
          }}
        >
          or click to browse
        </span>
      </div>

      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
        }}
      >
        VIDEO FILES ONLY · MAX 2GB
      </div>

      <input
        id="ppe-file-input"
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />
    </div>
  )
}
