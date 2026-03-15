'use client'
import { useState } from 'react'
import { Video, Download } from 'lucide-react'

interface Props {
  videoUrl: string
  filename?: string
}

export default function AnalysisVideoPlayer({ videoUrl, filename = 'annotated_output.mp4' }: Props) {
  const [duration, setDuration] = useState<string>('')
  const isMock = videoUrl.includes('/mock-output')
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'
  const fullVideoUrl = videoUrl.startsWith('http') ? videoUrl : `${baseUrl}${videoUrl}`

  if (isMock) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: 260, background: 'var(--bg-void)', border: '1px solid var(--border)',
        borderRadius: 10, gap: 12, padding: 24,
      }}>
        <Video size={40} style={{ color: 'var(--text-dim)' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
            ANNOTATED OUTPUT VIDEO
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Mock mode — connect the Python AI service for real annotated video output
          </p>
        </div>
        <a
          href={videoUrl}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 6,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11,
            textDecoration: 'none', cursor: 'default',
          }}
        >
          <Download size={12} />
          Download Mock
        </a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <video
        src={fullVideoUrl}
        controls
        playsInline
        onLoadedMetadata={(e) => {
          const secs = Math.round((e.currentTarget as HTMLVideoElement).duration)
          setDuration(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`)
        }}
        style={{
          width: '100%', maxHeight: 420, objectFit: 'contain',
          background: 'var(--bg-void)', borderRadius: 10,
          border: '1px solid var(--border)', display: 'block',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {filename}{duration && ` · ${duration}`}
        </span>
        <a
          href={fullVideoUrl}
          download={filename}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 6,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 11,
            textDecoration: 'none', letterSpacing: '0.04em', transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--cyan-border)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          <Download size={11} />
          Download Video
        </a>
      </div>
    </div>
  )
}
