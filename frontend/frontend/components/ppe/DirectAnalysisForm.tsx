'use client'
import { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Play, RefreshCw, AlertCircle, ChevronDown, ChevronUp, Upload, CheckCircle, Loader2, FileVideo } from 'lucide-react'
import type { AnalysisResponse } from '@/api/types'
import type { AnalysisStatus } from '@/store/analysisStore'
import { jobService } from '@/api/services/jobService'
import { useJobStore } from '@/store/jobStore'

const schema = z.object({
  conf:                 z.number().min(0.05).max(0.95),
  iou:                  z.number().min(0.10).max(0.90),
  draw_points:          z.boolean(),
  live_preview_stride:  z.number().int().min(1).max(60),
  stationary_seconds_threshold: z.number().int().min(1).max(30),
  late_arrivals_text:   z.string(),
  absence_text:         z.string(),
  recipient_email:      z.string().email('Invalid email format').or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

interface Props {
  status: AnalysisStatus
  onProcessing: () => void
  onCompleted: (r: AnalysisResponse) => void
  onFailed:    (e: string) => void
}

function RangeSlider({ label, value, min, max, step, onChange, formatValue }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; formatValue: (v: number) => string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{label}</label>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)', fontVariantNumeric: 'tabular-nums' }}>{formatValue(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%', height: 4, borderRadius: 2, outline: 'none', cursor: 'pointer',
          appearance: 'none', WebkitAppearance: 'none',
          background: `linear-gradient(to right, var(--cyan) ${pct}%, var(--border) ${pct}%)`,
        }}
      />
    </div>
  )
}

function CollapseSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-elevated)', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{title}</span>
        {open ? <ChevronUp size={12} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />}
      </button>
      {open && <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>}
    </div>
  )
}

export default function DirectAnalysisForm({ status, onProcessing, onCompleted, onFailed }: Props) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>('')
  const [dragging, setDragging]   = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { conf: 0.25, iou: 0.45, draw_points: false, live_preview_stride: 10, stationary_seconds_threshold: 3, late_arrivals_text: '', absence_text: '', recipient_email: '' },
  })

  const conf    = watch('conf')
  const iou     = watch('iou')
  const stride  = watch('live_preview_stride')
  const drawPts = watch('draw_points')

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'video/mp4') { setVideoFile(file); setFileError('') }
    else setFileError('Only MP4 video files are accepted')
  }, [])

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) { setVideoFile(file); setFileError('') }
  }

  async function onSubmit(data: FormValues) {
    if (!videoFile) { setFileError('A video file is required'); return }
    onProcessing()

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

    try {
      // Step 1: Upload video and start the job
      const fd = new FormData()
      fd.append('video',                        videoFile)
      fd.append('conf_threshold',               String(data.conf))
      fd.append('iou_threshold',                String(data.iou))
      fd.append('draw_center_points',           String(data.draw_points))
      fd.append('preview_stride',               String(data.live_preview_stride))
      fd.append('stationary_seconds_threshold', String(data.stationary_seconds_threshold))
      fd.append('late_arrivals_text',           data.late_arrivals_text)
      fd.append('absence_text',                 data.absence_text)
      fd.append('recipient_email',              data.recipient_email)

      const uploadResp = await fetch(`${API_BASE}/api/v1/videos/analyze`, {
        method: 'POST',
        body: fd,
        // No credentials – these endpoints don't require auth and withCredentials
        // causes CORS preflight to fail when origin is e.g. localhost:3000
        credentials: 'omit',
      })
      if (!uploadResp.ok) {
        const errJson = await uploadResp.json().catch(() => ({}))
        throw new Error(errJson?.detail || `Upload failed: ${uploadResp.status}`)
      }
      const uploadJson = await uploadResp.json()
      const jobId: string = uploadJson?.data?.jobId || uploadJson?.jobId
      if (!jobId) throw new Error('Server did not return a job ID')

      useJobStore.getState().setJobId(jobId)
      useJobStore.getState().setAppState('QUEUED')

      // Step 2: Poll job status every 2s
      const interval = setInterval(async () => {
        try {
          const statusResp = await fetch(`${API_BASE}/api/v1/jobs/${jobId}`, { credentials: 'omit' })
          const statusJson = await statusResp.json()
          const job = statusJson?.data ?? statusJson

          if (job?.status === 'completed') {
            clearInterval(interval)
            // Step 3: Fetch raw result
            const rawResp = await fetch(`${API_BASE}/api/v1/jobs/${jobId}/raw_result`, { credentials: 'omit' })
            const raw = await rawResp.json()
            if (raw?.error) { onFailed(raw.error); return }
            // Prefix relative video URL with backend base
            if (raw?.output_video_url && raw.output_video_url.startsWith('/')) {
              raw.output_video_url = `${API_BASE}${raw.output_video_url}`
            }
            onCompleted(raw)
          } else if (job?.status === 'failed') {
            clearInterval(interval)
            onFailed(job?.errorMessage || 'Analysis failed')
          }
        } catch { /* network hiccup – keep polling */ }
      }, 2000)

    } catch (err) {
      onFailed(err instanceof Error ? err.message : 'Analysis failed')
    }
  }

  const processing = status === 'processing'
  const fmtBytes = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Video Upload ── */}
      <div>
        <input ref={fileInputRef} type="file" accept="video/mp4" style={{ display: 'none' }} onChange={pickFile} />
        {!videoFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            style={{
              border: `2px dashed ${dragging ? 'var(--cyan)' : 'var(--border-bright)'}`,
              borderRadius: 10, padding: '28px 16px', textAlign: 'center',
              background: dragging ? 'var(--cyan-dim)' : 'var(--bg-elevated)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <Upload size={24} style={{ color: dragging ? 'var(--cyan)' : 'var(--text-dim)', marginBottom: 8 }} />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>Drop MP4 here or <span style={{ color: 'var(--cyan)' }}>click to browse</span></p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>MP4 format only · Max 2 GB</p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--green-dim)', border: '1px solid rgba(0,229,160,0.3)', borderRadius: 8 }}>
            <CheckCircle size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><FileVideo size={12} style={{ marginRight: 4 }} />{videoFile.name}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{fmtBytes(videoFile.size)}</p>
            </div>
            <button type="button" onClick={() => { setVideoFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 5px' }}>Change</button>
          </div>
        )}
        {fileError && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', marginTop: 5 }}>{fileError}</p>}
      </div>

      {/* ── Inference Controls ── */}
      <CollapseSection title="INFERENCE SETTINGS">
        <RangeSlider label="Confidence Threshold" value={conf} min={0.05} max={0.95} step={0.05} onChange={(v) => setValue('conf', v)} formatValue={(v) => `${(v * 100).toFixed(0)}%`} />
        <RangeSlider label="IoU Threshold" value={iou} min={0.10} max={0.90} step={0.05} onChange={(v) => setValue('iou', v)} formatValue={(v) => `${(v * 100).toFixed(0)}%`} />

        {/* Draw center points toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', cursor: 'pointer' }}>
            Draw detection center points
          </label>
          <button
            type="button"
            onClick={() => setValue('draw_points', !drawPts)}
            style={{ width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'background 0.2s', background: drawPts ? 'var(--cyan)' : 'var(--border)', position: 'relative', flexShrink: 0 }}
          >
            <div style={{ position: 'absolute', top: 2, left: drawPts ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </button>
        </div>

        {/* Preview stride */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Preview every N frames</label>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)' }}>{stride}</span>
          </div>
          <input
            type="number" min={1} max={60} {...register('live_preview_stride', { valueAsNumber: true })}
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Stationary threshold */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Idle Time Penalty (sec)</label>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)' }}>{watch('stationary_seconds_threshold')}s</span>
          </div>
          <input
            type="number" min={1} max={30} {...register('stationary_seconds_threshold', { valueAsNumber: true })}
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
          />
        </div>
      </CollapseSection>

      {/* ── Safety Scoring ── */}
      <CollapseSection title="SAFETY SCORING" defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Late Arrivals</label>
          <textarea {...register('late_arrivals_text')} placeholder="Worker-1=1, Worker-2=0" rows={2}
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
          />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>Format: WorkerID=count, separated by commas</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Absences</label>
          <textarea {...register('absence_text')} placeholder="Worker-1=0, Worker-2=1" rows={2}
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
          />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>Format: WorkerID=count, separated by commas</p>
        </div>
      </CollapseSection>

      {/* ── Email ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>RECIPIENT EMAIL</label>
        <input
          type="email"
          {...register('recipient_email')}
          placeholder="analyst@company.com (optional)"
          style={{ background: 'var(--bg-elevated)', border: `1px solid ${errors.recipient_email ? 'var(--red)' : 'var(--border)'}`, color: 'var(--text-primary)', borderRadius: 6, padding: '9px 12px', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
          onFocus={(e) => { if (!errors.recipient_email) { e.target.style.borderColor = 'var(--cyan-border)'; e.target.style.boxShadow = '0 0 0 3px var(--cyan-dim)' } }}
          onBlur={(e)  => { e.target.style.borderColor = errors.recipient_email ? 'var(--red)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />
        {errors.recipient_email ? (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertCircle size={10} />{errors.recipient_email.message}
          </p>
        ) : (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>Leave empty to skip email delivery</p>
        )}
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={processing}
        style={{
          width: '100%', padding: '13px', borderRadius: 8, border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
          background: processing ? 'var(--border)' : status === 'failed' ? 'var(--red-dim)' : 'var(--cyan)',
          color: processing ? 'var(--text-muted)' : status === 'failed' ? 'var(--red)' : '#000',
          fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { if (!processing) e.currentTarget.style.boxShadow = '0 0 20px var(--cyan-glow)' }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
      >
        {processing
          ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />ANALYZING...</>
          : status === 'completed'
          ? <><RefreshCw size={13} />RUN AGAIN</>
          : status === 'failed'
          ? <><AlertCircle size={13} />RETRY ANALYSIS</>
          : <><Play size={13} />RUN ANALYSIS</>}
      </button>
      <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginTop: -6 }}>
        Powered by YOLO + DeepSORT
      </p>
    </form>
  )
}
