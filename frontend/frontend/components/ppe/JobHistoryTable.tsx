'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, Download, Trash2, AlertTriangle } from 'lucide-react'
import { jobService } from '@/api/services/jobService'
import type { PpeJob, JobStatus } from '@/api/types'
import { format } from 'date-fns'

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; bg: string }> = {
  queued:    { label: 'QUEUED',    color: 'var(--amber)',  bg: 'var(--amber-dim)' },
  running:   { label: 'RUNNING',   color: 'var(--cyan)',   bg: 'var(--cyan-dim)'  },
  completed: { label: 'COMPLETED', color: 'var(--green)',  bg: 'var(--green-dim)' },
  failed:    { label: 'FAILED',    color: 'var(--red)',    bg: 'var(--red-dim)'   },
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDuration(start: string | null, end: string | null): string {
  if (!start || !end) return '—'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

interface ConfirmDialogProps {
  jobName: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({ jobName, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, backdropFilter: 'blur(2px)' }}
      />
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--red)',
          borderRadius: 10,
          padding: '24px',
          width: 360,
          zIndex: 1001,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <AlertTriangle size={18} style={{ color: 'var(--red)' }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Delete Job?
          </span>
        </div>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
          This will permanently delete &quot;<strong>{jobName}</strong>&quot; and all associated results.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: 6,
              color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace",
              fontSize: 11, cursor: 'pointer',
            }}
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px', background: 'var(--red)',
              border: 'none', borderRadius: 6,
              color: '#fff', fontFamily: "'DM Mono', monospace",
              fontSize: 11, cursor: 'pointer', fontWeight: 600,
            }}
          >
            DELETE
          </button>
        </div>
      </div>
    </>
  )
}

export default function JobHistoryTable() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<PpeJob | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', statusFilter, startDate, endDate],
    queryFn: () =>
      jobService.list({
        status: statusFilter === 'all' ? undefined : statusFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 50,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      setDeleteTarget(null)
    },
  })

  const jobs = data?.data ?? []
  const statusTabs = ['all', 'queued', 'running', 'completed', 'failed']

  const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    borderBottom: '1px solid var(--border)',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  }

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {statusTabs.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '5px 12px',
                borderRadius: 5,
                border: `1px solid ${statusFilter === s ? 'var(--cyan)' : 'var(--border)'}`,
                background: statusFilter === s ? 'var(--cyan-dim)' : 'transparent',
                color: statusFilter === s ? 'var(--cyan)' : 'var(--text-muted)',
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Date range */}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            padding: '5px 10px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 5,
            color: 'var(--text-primary)', fontFamily: "'DM Mono', monospace", fontSize: 11,
          }}
        />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>TO</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            padding: '5px 10px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 5,
            color: 'var(--text-primary)', fontFamily: "'DM Mono', monospace", fontSize: 11,
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)' }}>
              <th style={thStyle}>JOB ID</th>
              <th style={thStyle}>FILENAME</th>
              <th style={thStyle}>SUBMITTED</th>
              <th style={thStyle}>DURATION</th>
              <th style={thStyle}>FRAMES</th>
              <th style={thStyle}>STATUS</th>
              <th style={thStyle}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ height: 12, background: 'var(--border)', borderRadius: 4 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : jobs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: '40px', textAlign: 'center',
                    fontFamily: "'DM Mono', monospace", fontSize: 12,
                    color: 'var(--text-muted)',
                  }}
                >
                  NO JOBS FOUND
                </td>
              </tr>
            ) : (
              jobs.map((job, i) => {
                const cfg = STATUS_CONFIG[job.status]
                return (
                  <tr
                    key={job.id}
                    style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay, #1a2035)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)')}
                  >
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
                      {job.id.slice(0, 8)}…
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--text-primary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {job.originalFilename}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: "'Roboto Mono', monospace", fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {format(new Date(job.createdAt), 'MMM d, HH:mm')}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: "'Roboto Mono', monospace", fontSize: 12, color: 'var(--text-secondary)' }}>
                      {formatDuration(job.startedAt, job.completedAt)}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: "'Roboto Mono', monospace", fontSize: 12, color: 'var(--cyan)' }}>
                      {job.processedFrames != null ? job.processedFrames.toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4,
                        background: cfg.bg, border: `1px solid ${cfg.color}33`,
                        fontFamily: "'DM Mono', monospace", fontSize: 9,
                        color: cfg.color, letterSpacing: '0.06em',
                      }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          title="View"
                          style={{
                            padding: '5px 8px', background: 'transparent',
                            border: '1px solid var(--border)', borderRadius: 5,
                            color: 'var(--cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                          }}
                        >
                          <Eye size={12} />
                        </button>
                        {job.status === 'completed' && (
                          <button
                            title="Download"
                            onClick={() => window.open(jobService.getDownloadUrl(job.id), '_blank')}
                            style={{
                              padding: '5px 8px', background: 'transparent',
                              border: '1px solid var(--border)', borderRadius: 5,
                              color: 'var(--green)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                            }}
                          >
                            <Download size={12} />
                          </button>
                        )}
                        <button
                          title="Delete"
                          onClick={() => setDeleteTarget(job)}
                          style={{
                            padding: '5px 8px', background: 'transparent',
                            border: '1px solid var(--border)', borderRadius: 5,
                            color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm dialog */}
      {deleteTarget && (
        <ConfirmDialog
          jobName={deleteTarget.originalFilename}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
