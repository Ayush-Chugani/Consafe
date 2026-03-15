'use client'
import { lazy, Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Upload, AlertCircle, Video, RefreshCw, Download, Shield, Loader2 } from 'lucide-react'
import { useJobStore }       from '@/store/jobStore'
import { useAnalysisStore }  from '@/store/analysisStore'
import type { AnalysisStatus } from '@/store/analysisStore'
import { jobService }        from '@/api/services/jobService'
import { useSSEStream }      from '@/hooks/useSSEStream'
import { useJobPolling }     from '@/hooks/useJobPolling'
import { Card }              from '@/components/custom/Card'
import { Badge }             from '@/components/custom/Badge'
import { Button }            from '@/components/custom/Button'
import { formatDate, formatBytes } from '@/lib/utils'
import DirectAnalysisForm    from '@/components/ppe/DirectAnalysisForm'
import AnalysisResultsPanel  from '@/components/ppe/AnalysisResultsPanel'
import type { JobStatus }    from '@/api/types'

const UploadPanel       = lazy(() => import('@/components/ppe/UploadPanel'))
const InferenceSettings = lazy(() => import('@/components/ppe/InferenceSettingsPanel'))
const LivePreview       = lazy(() => import('@/components/ppe/LivePreview'))
const ProgressBar       = lazy(() => import('@/components/ppe/ProgressBar'))

// ─── Status chip ──────────────────────────────────────────────
const STATUS_STYLE: Record<AnalysisStatus, { bg: string; color: string; label: string; pulse?: boolean }> = {
  idle:       { bg: 'var(--bg-elevated)', color: 'var(--text-muted)',  label: 'IDLE' },
  processing: { bg: 'var(--cyan-dim)',    color: 'var(--cyan)',        label: 'PROCESSING', pulse: true },
  completed:  { bg: 'var(--green-dim)',   color: 'var(--green)',       label: 'COMPLETED'  },
  failed:     { bg: 'var(--red-dim)',     color: 'var(--red)',         label: 'FAILED'     },
}

function StatusChip({ status }: { status: AnalysisStatus }) {
  const s = STATUS_STYLE[status]
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: s.bg, border: `1px solid ${s.color}44` }}>
      {s.pulse && <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: s.color, letterSpacing: '0.1em' }}>{s.label}</span>
    </div>
  )
}

// ─── Idle placeholder ─────────────────────────────────────────
function IdlePlaceholder() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, border: '1px dashed var(--border)', borderRadius: 12, padding: 40, gap: 14, textAlign: 'center' }}>
      <Shield size={52} style={{ color: 'var(--text-dim)' }} />
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>AWAITING ANALYSIS</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)', maxWidth: 320 }}>
        Configure settings on the left, upload a video file, then click <strong>Run Analysis</strong> to begin
      </p>
    </div>
  )
}

// ─── Processing skeleton ──────────────────────────────────────
function AnalyzerLivePreviewWrapper() {
  const { jobId, appState } = useJobStore()
  useSSEStream(jobId)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <LivePreview />
      <div style={{ textAlign: 'center', padding: 12, border: '1px dashed var(--border)', borderRadius: 8 }}>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
          {appState === 'QUEUED' ? 'Initializing background workers...' : 'Running analysis on cluster nodes...'}
        </span>
      </div>
    </div>
  )
}

// ─── Error panel ──────────────────────────────────────────────
function ErrorPanel({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 40, border: '1px solid rgba(255,77,106,0.3)', borderRadius: 12, background: 'var(--red-dim)', textAlign: 'center' }}>
      <AlertCircle size={32} style={{ color: 'var(--red)' }} />
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--red)', letterSpacing: '0.06em' }}>ANALYSIS FAILED</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)', maxWidth: 400 }}>{error}</p>
      <Button variant="ghost" size="sm" icon={<RefreshCw size={12} />} onClick={onRetry}>Try Again</Button>
    </div>
  )
}

// ─── Job Queue tab (SSE-based streaming system) ───────────────
const JOB_BADGE: Record<JobStatus, 'cyan' | 'amber' | 'green' | 'red'> = {
  queued: 'amber', running: 'cyan', completed: 'green', failed: 'red',
}

function JobRow({ job, onSelect }: { job: { id: string; originalFilename: string; status: JobStatus; progress: number; createdAt: string; fileSizeBytes: number }; onSelect: (id: string) => void }) {
  return (
    <tr
      style={{ borderBottom: '1px solid var(--border-dim)', cursor: 'pointer', transition: 'background 0.1s' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      onClick={() => onSelect(job.id)}
    >
      <td style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Video size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {job.originalFilename}
          </span>
        </div>
      </td>
      <td style={{ padding: '10px 12px' }}>
        <Badge variant={JOB_BADGE[job.status]} dot={job.status === 'running'} pulse={job.status === 'running'}>{job.status}</Badge>
      </td>
      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{job.progress.toFixed(0)}%</td>
      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{formatBytes(job.fileSizeBytes)}</td>
      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{formatDate(job.createdAt)}</td>
      <td style={{ padding: '10px 12px' }}>
        {job.status === 'completed' && (
          <a href={jobService.getDownloadUrl(job.id)} onClick={(e) => e.stopPropagation()} style={{ color: 'var(--cyan)', fontSize: 11, fontFamily: 'var(--font-mono)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Download size={11} />Download
          </a>
        )}
      </td>
    </tr>
  )
}

function JobResultPanel({ jobId }: { jobId: string }) {
  const { data: result, isLoading } = useQuery({
    queryKey: ['job-result', jobId],
    queryFn: () => jobService.result(jobId),
    enabled: !!jobId,
  })
  if (isLoading) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Loading results...</div>
  if (!result) return null
  const { metrics, classCounts, workerSummaries } = result
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Frames Analyzed',  value: metrics.processedFrames.toLocaleString() },
          { label: 'Violation Frames', value: metrics.framesWithMissingPpe.toLocaleString() },
          { label: 'Max People/Frame', value: metrics.maxPeopleInFrame.toString() },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>
      {classCounts.length > 0 && (
        <Card title="PPE Detection Counts">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {classCounts.map((c) => (
              <div key={c.className} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', textTransform: 'capitalize' }}>{c.className.replace(/_/g, ' ')}</span>
                <span style={{ fontSize: 12, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{c.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
      {workerSummaries.length > 0 && (
        <Card title="Worker PPE Summary">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {workerSummaries.map((w) => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 6, border: `1px solid ${w.missingEvents > 0 ? 'rgba(255,77,106,0.2)' : 'var(--border)'}` }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{w.workerLabel}</p>
                  {w.missingItems && <p style={{ fontSize: 10, color: 'var(--amber)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>Missing: {w.missingItems}</p>}
                </div>
                <Badge variant={w.missingEvents > 0 ? 'red' : 'green'}>{w.missingEvents > 0 ? `${w.missingEvents} violations` : 'Compliant'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function JobQueueTab() {
  const { file, jobId: activeJobId, appState, errorMessage, reset } = useJobStore()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  useSSEStream(activeJobId)
  useJobPolling(activeJobId)
  const { data: jobsData, refetch: refetchJobs } = useQuery({
    queryKey: ['jobs-list'],
    queryFn: () => jobService.list({ limit: 20 }),
    refetchInterval: 30_000,
  })
  const jobs = jobsData?.data ?? []

  async function handleAnalyze() {
    if (!file) return
    const store = useJobStore.getState()
    store.setAppState('UPLOADING')
    try {
      const { jobId: newJobId } = await jobService.analyze(file, {
        conf_threshold:  store.settings.conf_threshold,
        iou_threshold:   store.settings.iou_threshold,
        preview_stride:  store.settings.preview_stride,
        preview_width:   store.settings.preview_width,
        draw_center_points: store.settings.draw_center_points,
        stationary_seconds_threshold: store.settings.stationary_seconds_threshold,
      })
      store.setJobId(newJobId)
      store.setAppState('QUEUED')
      refetchJobs()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Upload failed'
      store.setError(msg)
    }
  }

  const isActive = appState !== 'IDLE' && appState !== 'COMPLETED' && appState !== 'FAILED'
  const displayJobId = selectedJobId ?? (appState === 'COMPLETED' ? activeJobId : null)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Suspense fallback={null}>
            <UploadPanel />
            <InferenceSettings />
            <ProgressBar />
          </Suspense>
          {errorMessage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'var(--red-dim)', border: '1px solid rgba(255,77,106,0.3)' }}>
              <AlertCircle size={14} style={{ color: 'var(--red)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{errorMessage}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" size="md" icon={<Upload size={13} />} loading={isActive} disabled={!file || isActive} onClick={handleAnalyze} style={{ flex: 1 }}>
              {isActive ? 'Analyzing...' : 'Analyze Video'}
            </Button>
            {(appState === 'COMPLETED' || appState === 'FAILED') && (
              <Button variant="ghost" size="md" icon={<RefreshCw size={13} />} onClick={reset}>Reset</Button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Suspense fallback={null}><LivePreview /></Suspense>
          {displayJobId && (appState === 'COMPLETED' || selectedJobId) && <JobResultPanel jobId={displayJobId} />}
        </div>
      </div>

      <Card
        title="Analysis History"
        subtitle="Recent video analysis jobs"
        data-reveal=""
        style={{ marginTop: 28 }}
        action={<Button variant="ghost" size="sm" icon={<RefreshCw size={11} />} onClick={() => refetchJobs()}>Refresh</Button>}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['File', 'Status', 'Progress', 'Size', 'Submitted', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>No analysis jobs yet. Upload a video to get started.</td></tr>
              ) : jobs.map((job) => (
                <JobRow key={job.id} job={job} onSelect={(id) => setSelectedJobId(id === selectedJobId ? null : id)} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────
export default function PPEPage() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'queue'>('analyzer')
  const { status, result, error, setProcessing, setCompleted, setFailed, reset } = useAnalysisStore()

  return (
    <div>
      {/* Header */}
      <div data-reveal="" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6, flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', margin: 0 }}>
            PPE Worker Safety Analyzer
          </h2>
          <StatusChip status={status} />
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
          Video-based PPE compliance and worker risk scoring
        </p>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)' }}>
          {(['analyzer', 'queue'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '9px 22px', background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--cyan)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--cyan)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: -1, transition: 'color 0.2s',
              }}
            >
              {tab === 'analyzer' ? 'Analyzer' : 'Job Queue'}
            </button>
          ))}
        </div>
      </div>

      {/* Analyzer tab */}
      {activeTab === 'analyzer' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ position: 'sticky', top: 28 }}>
            <DirectAnalysisForm
              status={status}
              onProcessing={setProcessing}
              onCompleted={setCompleted}
              onFailed={setFailed}
            />
          </div>
          <div>
            {status === 'idle'       && <IdlePlaceholder />}
            {status === 'processing' && <AnalyzerLivePreviewWrapper />}
            {status === 'failed'  && error && <ErrorPanel error={error} onRetry={reset} />}
            {status === 'completed' && result && <AnalysisResultsPanel result={result} />}
          </div>
        </div>
      )}

      {/* Job Queue tab */}
      {activeTab === 'queue' && <JobQueueTab />}
    </div>
  )
}
