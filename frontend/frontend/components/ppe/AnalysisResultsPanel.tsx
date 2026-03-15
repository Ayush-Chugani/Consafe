'use client'
import AnalysisVideoPlayer  from './AnalysisVideoPlayer'
import AnalysisKpiCards     from './AnalysisKpiCards'
import WorkerMissingTable   from './WorkerMissingTable'
import SafetyInsights       from './SafetyInsights'
import SafetyRankingTable   from './SafetyRankingTable'
import ReportPanel          from './ReportPanel'
import type { AnalysisResponse } from '@/api/types'

interface Props { result: AnalysisResponse }

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      data-reveal=""
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}
    >
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>{title}</p>
        {subtitle && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{subtitle}</p>}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}

export default function AnalysisResultsPanel({ result }: Props) {
  function handleDownload() {
    const a = document.createElement('a')
    a.href = result.output_video_url
    a.download = 'annotated_output.mp4'
    a.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* 1. Video player */}
      <div data-reveal="">
        <AnalysisVideoPlayer videoUrl={result.output_video_url} />
      </div>

      {/* 2. KPI cards */}
      <AnalysisKpiCards result={result} />

      {/* 3. Worker missing equipment */}
      <Section title="WORKER MISSING EQUIPMENT" subtitle="Per-worker PPE violation breakdown">
        <WorkerMissingTable rows={result.worker_rows} />
      </Section>

      {/* 4. Safety insights */}
      <Section title="WORKER SAFETY INSIGHTS" subtitle="Top performers and workers requiring attention">
        <SafetyInsights rows={result.safety_rows} />
      </Section>

      {/* 5. Full safety ranking */}
      <Section title="FULL SAFETY RANKING" subtitle={`${result.safety_rows.length} workers ranked by safety score`}>
        <SafetyRankingTable rows={result.safety_rows} />
      </Section>

      {/* 6. Report + email */}
      <div data-reveal="">
        <ReportPanel
          reportText={result.report_text}
          emailStatus={result.auto_email_status}
          onDownload={handleDownload}
        />
      </div>

    </div>
  )
}
