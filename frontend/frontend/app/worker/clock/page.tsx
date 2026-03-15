'use client'
import { Camera, Shield } from 'lucide-react'

export default function WorkerClockPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'var(--bg-void)' }}
    >
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2,
        background: 'var(--cyan)', zIndex: 9999,
      }} />

      <div className="text-center">
        <div
          className="flex items-center justify-center mx-auto mb-6 rounded-full"
          style={{
            width: 80, height: 80,
            background: 'var(--cyan-dim)',
            border: '2px solid var(--cyan-border)',
          }}
        >
          <Camera size={36} style={{ color: 'var(--cyan)' }} />
        </div>
        <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
          Worker Face Clock-In
        </h1>
        <p className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
          Look directly at the camera to register your attendance
        </p>
        <div
          className="mt-8 px-6 py-3 rounded font-mono text-xs tracking-widest"
          style={{
            background: 'var(--green-dim)',
            border: '1px solid var(--green-glow)',
            color: 'var(--green)',
          }}
        >
          CAMERA ACTIVE — SCANNING
        </div>

        <div className="mt-12 flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <Shield size={14} />
          <span className="font-mono text-xs">PPE Analytics Attendance System</span>
        </div>
      </div>
    </div>
  )
}
