'use client'
import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format, subDays, parseISO } from 'date-fns'
import {
  Calendar, Download, ChevronLeft, ChevronRight,
  LayoutGrid, Table2, Camera, ScanFace, UserPlus,
} from 'lucide-react'
import { attendanceService } from '@/api/services/attendanceService'
import { workerService } from '@/api/services/workerService'
import { Card } from '@/components/custom/Card'
import { Badge } from '@/components/custom/Badge'
import { Button } from '@/components/custom/Button'
import AttendanceSummaryBar from '@/components/attendance/AttendanceSummaryBar'
import AttendanceGrid from '@/components/attendance/AttendanceGrid'
import FaceProofModal from '@/components/attendance/FaceProofModal'
import FaceCameraModal from '@/components/attendance/FaceCameraModal'
import type { WorkerFormData } from '@/components/attendance/FaceCameraModal'
import type { AttendanceStatus, AttendanceRecord } from '@/api/types'
import { API } from '@/api/endpoints'

const STATUS_VARIANT: Record<AttendanceStatus, 'green' | 'red' | 'amber' | 'cyan'> = {
  present: 'green', absent: 'red', late: 'amber', on_leave: 'cyan',
}
const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: 'Present', absent: 'Absent', late: 'Late', on_leave: 'On Leave',
}

function formatTime(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
function formatDurationMins(minutes: number | null): string {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes}m`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

export default function AttendancePage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [selectedDate, setSelectedDate] = useState(today)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deptFilter, setDeptFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [page, setPage] = useState(1)
  const [proofRecord, setProofRecord] = useState<AttendanceRecord | null>(null)
  const limit = 24
  const queryClient = useQueryClient()

  // Face modal state
  const [cameraMode, setCameraMode] = useState<'enroll' | 'recognize' | null>(null)
  const [clockMode, setClockMode] = useState<'clock_in' | 'clock_out'>('clock_in')

  const { data: summary } = useQuery({
    queryKey: ['attendance-summary', selectedDate],
    queryFn: () => attendanceService.summary(selectedDate),
  })

  const { data: listData, isLoading } = useQuery({
    queryKey: ['attendance-list', selectedDate, statusFilter, deptFilter, page],
    queryFn: () =>
      attendanceService.list({
        date: selectedDate,
        status: statusFilter === 'all' ? undefined : statusFilter,
        department: deptFilter || undefined,
        page,
        limit,
      }),
    placeholderData: (prev) => prev,
  })

  const { data: workersData } = useQuery({
    queryKey: ['workers-list-for-enroll'],
    queryFn: () => workerService.list({ page: 1, limit: 100 }),
  })
  const workersForEnroll = workersData?.data ?? []

  function prevDay() {
    setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))
    setPage(1)
  }
  function nextDay() {
    const next = format(subDays(parseISO(selectedDate), -1), 'yyyy-MM-dd')
    if (next <= today) { setSelectedDate(next); setPage(1) }
  }

  const isToday = selectedDate === today
  const records = listData?.data ?? []
  const total = listData?.total ?? 0
  const totalPages = Math.ceil(total / limit)
  const departments = [...new Set(records.map((r) => r.worker?.department).filter(Boolean))]
  const summaryData = summary ?? { present: 0, absent: 0, late: 0, onLeave: 0, total: 0 }

  // Enroll face handler — creates worker first, then enrolls face
  async function handleEnroll(workerData: WorkerFormData, imageB64: string) {
    // Step 1: Create the worker in the DB
    const createRes = await fetch(API.WORKERS.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: workerData.name,
        workerCode: workerData.workerCode,
        department: workerData.department,
        jobTitle: workerData.jobTitle,
        siteLocation: workerData.siteLocation,
      }),
    })
    const createJson = await createRes.json()
    if (!createJson.success) throw new Error(createJson.error || 'Failed to create worker')
    const newWorkerId: string = createJson.data.id

    // Step 2: Enroll the face
    const enrollRes = await fetch(API.WORKERS.ENROLL_FACE(newWorkerId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_b64: imageB64 }),
    })
    const enrollJson = await enrollRes.json()
    if (!enrollJson.success) throw new Error(enrollJson.error || 'Face enrollment failed')

    queryClient.invalidateQueries({ queryKey: ['workers'] })
  }

  // Recognize + mark attendance handler
  async function handleRecognize(imageB64: string, mode: 'clock_in' | 'clock_out') {
    const res = await fetch(API.ATTENDANCE.RECOGNIZE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_b64: imageB64, mode }),
    })
    const json = await res.json()
    if (json.success) {
      queryClient.invalidateQueries({ queryKey: ['attendance-list'] })
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] })
    }
    return json
  }

  function openRecognize(mode: 'clock_in' | 'clock_out') {
    setClockMode(mode)
    setCameraMode('recognize')
  }

  return (
    <div>
      {/* Header */}
      <div data-reveal="" style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', marginBottom: 4 }}>
            FACE RECOGNITION ATTENDANCE
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {isToday ? 'TODAY — ' : ''}{format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setCameraMode('enroll')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11,
            }}
          >
            <UserPlus size={13} /> Register Worker
          </button>

          <button
            onClick={() => openRecognize('clock_in')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              background: 'var(--green-dim)', border: '1px solid var(--green-glow)',
              color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Camera size={13} /> Clock In
          </button>

          <button
            onClick={() => openRecognize('clock_out')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(255,190,50,0.12)', border: '1px solid rgba(255,190,50,0.3)',
              color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: 11,
              fontWeight: 600,
            }}
          >
            <ScanFace size={13} /> Clock Out
          </button>
        </div>
      </div>

      {/* Date nav + filters */}
      <div data-reveal="" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prevDay} style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={14} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px' }}>
            <Calendar size={13} style={{ color: 'var(--cyan)' }} />
            <input type="date" value={selectedDate} max={today} onChange={(e) => { setSelectedDate(e.target.value); setPage(1) }} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none', cursor: 'pointer' }} />
          </div>
          <button onClick={nextDay} disabled={isToday} style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: isToday ? 'var(--text-dim)' : 'var(--text-secondary)', cursor: isToday ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={14} />
          </button>
          {isToday && <Badge variant="cyan" dot pulse>Today</Badge>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1) }} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11, borderRadius: 6, padding: '5px 10px', outline: 'none', cursor: 'pointer' }}>
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d!}>{d}</option>)}
          </select>

          <div style={{ display: 'flex', gap: 3 }}>
            {(['all', 'present', 'absent', 'late', 'on_leave'] as const).map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }} style={{ padding: '5px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-mono)', background: statusFilter === s ? 'var(--cyan-dim)' : 'var(--bg-elevated)', border: `1px solid ${statusFilter === s ? 'var(--cyan-border)' : 'var(--border)'}`, color: statusFilter === s ? 'var(--cyan)' : 'var(--text-secondary)', transition: 'all 0.15s ease', textTransform: 'capitalize' }}>
                {s === 'all' ? 'All' : STATUS_LABEL[s as AttendanceStatus]}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            <button onClick={() => setViewMode('grid')} title="Grid view" style={{ padding: '5px 10px', background: viewMode === 'grid' ? 'var(--cyan-dim)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'grid' ? 'var(--cyan)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => setViewMode('table')} title="Table view" style={{ padding: '5px 10px', background: viewMode === 'table' ? 'var(--cyan-dim)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'table' ? 'var(--cyan)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <Table2 size={14} />
            </button>
          </div>

          <Button variant="secondary" size="sm" icon={<Download size={12} />}>Export</Button>
        </div>
      </div>

      {/* Summary bar */}
      <div data-reveal="" style={{ marginBottom: 20 }}>
        <AttendanceSummaryBar summary={summaryData} />
      </div>

      {/* Grid / Table view */}
      {viewMode === 'grid' ? (
        <div data-reveal="">
          <AttendanceGrid records={records} loading={isLoading} />
        </div>
      ) : (
        <Card data-reveal="">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Worker ID', 'Name', 'Department', 'Clock In', 'Clock Out', 'Duration', 'Status', 'Confidence', 'Proof'].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((__, j) => (
                        <td key={j} style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ height: 11, background: 'var(--border)', borderRadius: 3, width: '65%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      No records for this date
                    </td>
                  </tr>
                ) : records.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{rec.worker?.workerCode ?? '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {rec.worker?.referencePhotoUrl ? (
                          <img src={rec.worker.referencePhotoUrl} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                        ) : (
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--cyan)' }}>
                            {(rec.worker?.name ?? 'W').charAt(0)}
                          </div>
                        )}
                        <span style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{rec.worker?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{rec.worker?.department ?? '—'}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: rec.clockInTime ? 'var(--green)' : 'var(--text-dim)' }}>{formatTime(rec.clockInTime)}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: rec.clockOutTime ? 'var(--cyan)' : 'var(--text-dim)' }}>{formatTime(rec.clockOutTime)}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>{formatDurationMins(rec.durationMinutes)}</td>
                    <td style={{ padding: '10px 12px' }}><Badge variant={STATUS_VARIANT[rec.status]} dot>{STATUS_LABEL[rec.status]}</Badge></td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: rec.clockInConfidence != null && rec.clockInConfidence >= 0.9 ? 'var(--green)' : 'var(--amber)' }}>
                      {rec.clockInConfidence != null ? `${(rec.clockInConfidence * 100).toFixed(0)}%` : '—'}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {rec.clockInProofUrl ? (
                        <button onClick={() => setProofRecord(rec)} style={{ padding: '4px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 9, cursor: 'pointer', letterSpacing: '0.06em' }}>PROOF</button>
                      ) : <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{total} records · Page {page} of {totalPages}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} icon={<ChevronLeft size={12} />}>Prev</Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} icon={<ChevronRight size={12} />} iconPosition="right">Next</Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <FaceProofModal
        record={proofRecord as (AttendanceRecord & { worker: { id: string; name: string; workerCode: string; department: string; referencePhotoUrl: string | null } }) | null}
        open={proofRecord !== null}
        onClose={() => setProofRecord(null)}
      />

      {/* Face Camera Modal — Enroll (with name form) */}
      <FaceCameraModal
        open={cameraMode === 'enroll'}
        mode="enroll"
        onClose={() => setCameraMode(null)}
        onEnroll={handleEnroll}
      />

      {/* Face Camera Modal — Recognize / Clock In/Out */}
      <FaceCameraModal
        open={cameraMode === 'recognize'}
        mode="recognize"
        clockMode={clockMode}
        onClose={() => setCameraMode(null)}
        onRecognize={handleRecognize}
      />
    </div>
  )
}
