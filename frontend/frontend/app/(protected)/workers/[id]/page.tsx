'use client'
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { workerService } from '@/api/services/workerService'
import WorkerHero from '@/components/workers/WorkerHero'
import AttendanceHeatmap from '@/components/workers/AttendanceHeatmap'
import ViolationGallery from '@/components/workers/ViolationGallery'
import FaceRecognitionLog from '@/components/workers/FaceRecognitionLog'
import DayDetailDrawer from '@/components/attendance/DayDetailDrawer'
import { Card } from '@/components/custom/Card'
import type { AttendanceStatus } from '@/api/types'

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [drawerDate, setDrawerDate] = useState<string | null>(null)

  const { data: worker, isLoading } = useQuery({
    queryKey: ['worker', id],
    queryFn: () => workerService.get(id!),
    enabled: !!id,
  })

  const { data: attendance = [] } = useQuery({
    queryKey: ['worker-attendance', id],
    queryFn: () => workerService.getAttendance(id!),
    enabled: !!id,
  })

  const { data: violations } = useQuery({
    queryKey: ['worker-violations', id],
    queryFn: () => workerService.getViolations(id!, { limit: 24 }),
    enabled: !!id,
  })

  if (isLoading || !worker) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--cyan)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  // Prepare today's attendance record
  const todayStr = new Date().toISOString().slice(0, 10)
  const attendanceToday = attendance.find((r) => r.date === todayStr) ?? null

  // Build heatmap data from attendance
  const heatmapData = attendance.slice(0, 30).map((r) => ({
    date: r.date,
    status: r.status as AttendanceStatus,
    has_violations: false, // could be derived from violations
  }))

  // Find the attendance record for drawer
  const drawerRecord = drawerDate ? attendance.find((r) => r.date === drawerDate) ?? null : null

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push('/workers')}
        data-reveal=""
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13, padding: 0, transition: 'color 0.15s ease' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
      >
        <ArrowLeft size={14} />
        Back to Workers
      </button>

      {/* Worker hero */}
      <div style={{ marginBottom: 20 }}>
        <WorkerHero worker={worker} attendanceToday={attendanceToday} />
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Attendance heatmap */}
          <Card title="30-DAY ATTENDANCE" data-reveal="">
            <AttendanceHeatmap
              data={heatmapData}
              onDayClick={(date) => setDrawerDate(date)}
            />
          </Card>

          {/* Face recognition log */}
          <Card title="FACE RECOGNITION LOG" data-reveal="">
            <FaceRecognitionLog workerId={id!} />
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Compliance line chart (placeholder) */}
          <Card title="PPE COMPLIANCE TREND" data-reveal="">
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', borderRadius: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                COMPLIANCE CHART
              </span>
            </div>
          </Card>

          {/* Violation gallery */}
          <Card title="VIOLATION GALLERY" data-reveal="">
            <ViolationGallery
              violations={violations?.data ?? []}
              worker={worker}
            />
          </Card>
        </div>
      </div>

      {/* Day detail drawer */}
      <DayDetailDrawer
        date={drawerDate}
        worker={worker}
        open={drawerDate !== null}
        onClose={() => setDrawerDate(null)}
        attendanceRecord={drawerRecord}
      />
    </div>
  )
}
