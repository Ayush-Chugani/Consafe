'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Plus, Clock } from 'lucide-react'
import { reportService } from '@/api/services/reportService'
import { Card } from '@/components/custom/Card'
import { Badge } from '@/components/custom/Badge'
import { Button } from '@/components/custom/Button'
import { formatDate } from '@/lib/utils'
import type { ReportFormat, ReportType } from '@/api/types'

const REPORT_TYPES: Array<{ value: ReportType; label: string; description: string }> = [
  { value: 'daily_attendance', label: 'Daily Attendance', description: 'Complete attendance log for selected date range' },
  { value: 'ppe_compliance', label: 'PPE Compliance', description: 'PPE compliance metrics and violation analysis' },
  { value: 'worker_safety_score', label: 'Worker Safety Scores', description: 'Individual worker safety performance scores' },
  { value: 'violation_proof', label: 'Violation Proof Report', description: 'Detailed violation frames with proof images' },
  { value: 'monthly_summary', label: 'Monthly Summary', description: 'High-level monthly overview for management' },
  { value: 'incident_report', label: 'Incident Report', description: 'Specific incident documentation' },
]

const FORMAT_CONFIG: Record<ReportFormat, { label: string; color: string }> = {
  pdf: { label: 'PDF', color: 'var(--red)' },
  excel: { label: 'Excel', color: 'var(--green)' },
  csv: { label: 'CSV', color: 'var(--cyan)' },
}

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [reportType, setReportType] = useState<ReportType>('daily_attendance')
  const [format, setFormat] = useState<ReportFormat>('pdf')
  const [startDate, setStartDate] = useState(thirtyDaysAgo)
  const [endDate, setEndDate] = useState(today)
  const [includeProofImages, setIncludeProofImages] = useState(false)
  const [generating, setGenerating] = useState(false)

  const { data: scheduled = [] } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: () => reportService.listScheduled(),
  })

  async function handleGenerate() {
    setGenerating(true)
    try {
      const { downloadUrl } = await reportService.generate({
        type: reportType,
        format,
        startDate,
        endDate,
        includeProofImages,
      })
      // Trigger download
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `report_${reportType}_${startDate}_${endDate}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      // handle error
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      {/* Page header */}
      <div data-reveal="" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', marginBottom: 6 }}>
          Reports
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          Generate compliance reports and manage scheduled deliveries
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Report generator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Report type selector */}
          <Card title="Report Type" data-reveal="">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setReportType(type.value)}
                  style={{
                    padding: '12px 14px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    background: reportType === type.value ? 'var(--cyan-dim)' : 'var(--bg-elevated)',
                    border: `1px solid ${reportType === type.value ? 'var(--cyan-border)' : 'var(--border)'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <p style={{
                    fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600,
                    color: reportType === type.value ? 'var(--cyan)' : 'var(--text-primary)',
                    marginBottom: 4,
                  }}>
                    {type.label}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.4 }}>
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Date range + format + options */}
          <Card title="Report Configuration" data-reveal="">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 6 }}>
                  START DATE
                </label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)', borderRadius: 7,
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 6 }}>
                  END DATE
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={today}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)', borderRadius: 7,
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Format */}
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8 }}>
                FORMAT
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['pdf', 'excel', 'csv'] as ReportFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    style={{
                      padding: '7px 16px', borderRadius: 6, cursor: 'pointer',
                      background: format === f ? `${FORMAT_CONFIG[f].color}18` : 'var(--bg-elevated)',
                      border: `1px solid ${format === f ? FORMAT_CONFIG[f].color + '40' : 'var(--border)'}`,
                      color: format === f ? FORMAT_CONFIG[f].color : 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {FORMAT_CONFIG[f].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Include proof images toggle */}
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Include Proof Images</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>Attach violation frame screenshots to the report</p>
              </div>
              <button
                onClick={() => setIncludeProofImages(!includeProofImages)}
                style={{
                  width: 42, height: 24, borderRadius: 12,
                  background: includeProofImages ? 'var(--cyan)' : 'var(--border)',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 3,
                  left: includeProofImages ? 21 : 3,
                  width: 18, height: 18, borderRadius: '50%',
                  background: includeProofImages ? '#000' : 'var(--text-muted)',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>

            {/* Generate button */}
            <Button
              variant="primary"
              size="lg"
              icon={<Download size={14} />}
              loading={generating}
              onClick={handleGenerate}
              style={{ width: '100%', marginTop: 20 }}
            >
              {generating ? 'Generating...' : `Generate ${FORMAT_CONFIG[format].label} Report`}
            </Button>
          </Card>
        </div>

        {/* Scheduled reports */}
        <Card
          title="Scheduled Reports"
          action={
            <Button variant="ghost" size="sm" icon={<Plus size={11} />}>Schedule</Button>
          }
          data-reveal=""
        >
          {scheduled.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Clock size={24} style={{ color: 'var(--text-dim)', margin: '0 auto 8px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                No scheduled reports
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {scheduled.map((rep) => (
                <div key={rep.id} style={{
                  padding: '12px 14px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)', borderRadius: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {REPORT_TYPES.find(t => t.value === rep.reportType)?.label ?? rep.reportType}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        {rep.cronExpression}
                      </p>
                    </div>
                    <Badge variant={rep.isActive ? 'green' : 'gray'} dot>
                      {rep.isActive ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <Badge variant="default">
                      {rep.recipients.length} recipients
                    </Badge>
                    <Badge variant={FORMAT_CONFIG[rep.format].label === 'PDF' ? 'red' : rep.format === 'excel' ? 'green' : 'cyan'}>
                      {FORMAT_CONFIG[rep.format].label}
                    </Badge>
                  </div>
                  {rep.nextRunAt && (
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
                      Next: {formatDate(rep.nextRunAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
