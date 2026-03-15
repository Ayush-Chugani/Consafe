'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Camera, X, Check, RotateCcw, Loader2, AlertCircle, UserCheck, ChevronRight, Clock, Building2 } from 'lucide-react'

type ModalMode = 'enroll' | 'recognize'
type EnrollStep = 'form' | 'camera' | 'processing' | 'success' | 'error'
type RecognizeStep = 'scanning' | 'success' | 'error'

export interface WorkerFormData {
  name: string
  workerCode: string
  department: string
  jobTitle: string
  siteLocation: string
}

export interface RecognizeResult {
  success: boolean
  error?: string
  data?: {
    action: string
    worker: { id: string; name: string; workerCode: string; department: string }
    confidence: number
    attendanceRecord?: { clockInTime: string | null; clockOutTime: string | null; status: string }
  }
}

interface FaceCameraModalProps {
  open: boolean
  mode: ModalMode
  onClose: () => void
  /** Called during enrollment with the worker form data + captured face image */
  onEnroll?: (workerData: WorkerFormData, imageB64: string) => Promise<void>
  /** Called during recognition — returns the result */
  onRecognize?: (imageB64: string, clockMode: 'clock_in' | 'clock_out') => Promise<RecognizeResult>
  clockMode?: 'clock_in' | 'clock_out'
}

const PRESET_DEPTS = ['Engineering', 'Safety', 'Construction', 'Maintenance', 'Logistics', 'Admin']
const PRESET_LOCATIONS = ['Site A', 'Site B', 'Site C', 'Main Office']

export default function FaceCameraModal({
  open, mode, onClose, onEnroll, onRecognize, clockMode = 'clock_in',
}: FaceCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Enroll state
  const [enrollStep, setEnrollStep] = useState<EnrollStep>('form')
  const [form, setForm] = useState<WorkerFormData>({ name: '', workerCode: '', department: 'Engineering', jobTitle: '', siteLocation: 'Site A' })
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [enrollError, setEnrollError] = useState('')

  // Recognize state
  const [recStep, setRecStep] = useState<RecognizeStep>('scanning')
  const [recResult, setRecResult] = useState<RecognizeResult | null>(null)
  const [scanMsg, setScanMsg] = useState('Scanning… look into the camera')

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
    } catch {
      if (mode === 'enroll') setEnrollStep('error')
      else setRecStep('error')
    }
  }, [mode])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
  }, [])

  // Reset on open
  useEffect(() => {
    if (open) {
      setEnrollStep('form')
      setForm({ name: '', workerCode: '', department: 'Engineering', jobTitle: '', siteLocation: 'Site A' })
      setCapturedImage(null)
      setEnrollError('')
      setRecStep('scanning')
      setRecResult(null)
      setScanMsg('Scanning… look into the camera')
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [open, stopCamera])

  // Start camera when we reach camera step
  useEffect(() => {
    if (!open) return
    const needsCamera = (mode === 'enroll' && enrollStep === 'camera') || mode === 'recognize'
    if (needsCamera) {
      startCamera()
      if (mode === 'recognize') startRecognizeScan()
    } else {
      stopCamera()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, enrollStep, mode])

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) return null
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.85)
  }, [])

  // ────── ENROLL ──────────────────────────────────────────
  function handleFormNext(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    // Auto-generate worker code if empty
    if (!form.workerCode.trim()) {
      setForm(f => ({ ...f, workerCode: `WK-${Date.now().toString().slice(-4)}` }))
    }
    setEnrollStep('camera')
  }

  async function handleCapture() {
    const frame = captureFrame()
    if (!frame) return
    setCapturedImage(frame)
  }

  async function handleConfirmEnroll() {
    if (!capturedImage || !onEnroll) return
    setEnrollStep('processing')
    try {
      await onEnroll(form, capturedImage)
      setEnrollStep('success')
    } catch (err: unknown) {
      setEnrollError(err instanceof Error ? err.message : 'Enrollment failed. No clear face detected.')
      setEnrollStep('error')
    }
  }

  // ────── RECOGNIZE ────────────────────────────────────────
  function startRecognizeScan() {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
    scanIntervalRef.current = setInterval(async () => {
      if (!onRecognize) return
      const frame = captureFrame()
      if (!frame) return
      try {
        const result = await onRecognize(frame, clockMode)
        if (result.success && result.data) {
          clearInterval(scanIntervalRef.current!)
          stopCamera()
          setRecResult(result)
          setRecStep('success')
        } else if (result.error && !result.error.toLowerCase().includes('not recognized') && !result.error.toLowerCase().includes('no face')) {
          clearInterval(scanIntervalRef.current!)
          stopCamera()
          setRecResult(result)
          setRecStep('error')
        } else {
          setScanMsg('No match yet — keep looking at the camera…')
        }
      } catch { /* keep scanning */ }
    }, 2500)
  }

  function handleScanAnother() {
    setRecStep('scanning')
    setRecResult(null)
    setScanMsg('Scanning… look into the camera')
    startCamera()
    startRecognizeScan()
  }

  if (!open) return null

  const actionLabel = clockMode === 'clock_in' ? 'Clock In' : 'Clock Out'
  const actionColor = clockMode === 'clock_in' ? 'var(--green)' : 'var(--amber)'
  const actionBg = clockMode === 'clock_in' ? 'var(--green-dim)' : 'rgba(255,190,50,0.12)'
  const actionBorder = clockMode === 'clock_in' ? 'var(--green-glow)' : 'rgba(255,190,50,0.3)'

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, width: mode === 'enroll' && enrollStep === 'form' ? 480 : 620, maxWidth: '95vw', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.7)', transition: 'width 0.3s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Camera size={15} style={{ color: 'var(--cyan)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
              {mode === 'enroll' ? 'Register New Worker' : `Face ${actionLabel}`}
            </span>
            {mode === 'enroll' && (
              <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                {['Details', 'Capture', 'Done'].map((label, i) => {
                  const stepIdx = enrollStep === 'form' ? 0 : enrollStep === 'camera' ? 1 : 2
                  return (
                    <React.Fragment key={label}>
                      {i > 0 && <ChevronRight size={10} style={{ color: 'var(--text-dim)', alignSelf: 'center' }} />}
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: i <= stepIdx ? 'var(--cyan)' : 'var(--text-dim)', fontWeight: i === stepIdx ? 700 : 400 }}>{label}</span>
                    </React.Fragment>
                  )
                })}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4, borderRadius: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* ── ENROLL: STEP 1 — FORM ─────────────────────────────── */}
        {mode === 'enroll' && enrollStep === 'form' && (
          <form onSubmit={handleFormNext} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
              Enter the worker's information before capturing their face.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Full Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Alice Johnson" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Worker Code</label>
                <input value={form.workerCode} onChange={e => setForm(f => ({ ...f, workerCode: e.target.value }))} placeholder="Auto-generated" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Job Title</label>
                <input value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} placeholder="e.g. Technician" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Department</label>
                <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} style={inputStyle}>
                  {PRESET_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Site Location</label>
                <select value={form.siteLocation} onChange={e => setForm(f => ({ ...f, siteLocation: e.target.value }))} style={inputStyle}>
                  {PRESET_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button type="button" onClick={onClose} style={secondaryBtn}>Cancel</button>
              <button type="submit" style={primaryBtn}>Next — Capture Face →</button>
            </div>
          </form>
        )}

        {/* ── ENROLL: STEP 2 — CAMERA ───────────────────────────── */}
        {mode === 'enroll' && (enrollStep === 'camera' || enrollStep === 'processing') && (
          <>
            {/* Worker info strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--cyan-dim)', border: '2px solid var(--cyan-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--cyan)', flexShrink: 0 }}>
                {form.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{form.name}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>{form.department} · {form.siteLocation}</p>
              </div>
              <button onClick={() => { setCapturedImage(null); setEnrollStep('form'); stopCamera() }} style={{ ...secondaryBtn, marginLeft: 'auto', fontSize: 10, padding: '4px 10px' }}>← Edit Details</button>
            </div>

            <div style={{ position: 'relative', background: '#000', aspectRatio: '4/3', maxHeight: 340 }}>
              <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: capturedImage ? 'none' : 'block', transform: 'scaleX(-1)' }} />
              {capturedImage && <img src={capturedImage} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Face guide oval */}
              {!capturedImage && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ width: 180, height: 220, borderRadius: '50%', border: '2px dashed var(--cyan)', opacity: 0.7, boxShadow: '0 0 20px rgba(0,208,255,0.25)' }} />
                </div>
              )}

              {/* Instructions */}
              <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center' }}>
                <span style={{ background: 'rgba(0,0,0,0.7)', borderRadius: 20, padding: '4px 14px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>
                  {capturedImage ? 'Preview — confirm or retake' : 'Position face inside the oval, then capture'}
                </span>
              </div>
            </div>

            <div style={{ padding: '14px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {enrollStep === 'processing' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Detecting face and saving…
                </div>
              ) : capturedImage ? (
                <>
                  <button onClick={() => { setCapturedImage(null); startCamera() }} style={secondaryBtn}><RotateCcw size={12} /> Retake</button>
                  <button onClick={handleConfirmEnroll} style={primaryBtn}><Check size={12} /> Confirm Enroll</button>
                </>
              ) : (
                <button onClick={handleCapture} style={primaryBtn}><Camera size={12} /> Capture</button>
              )}
            </div>
          </>
        )}

        {/* ── ENROLL: SUCCESS ───────────────────────────────────── */}
        {mode === 'enroll' && enrollStep === 'success' && (
          <div style={{ padding: 36, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-dim)', border: '2px solid var(--green-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={28} style={{ color: 'var(--green)' }} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--green)', margin: '0 0 4px' }}>Enrolled Successfully!</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 2px' }}>{form.name} · {form.workerCode || 'WK-AUTO'}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{form.department} — {form.siteLocation}</p>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', maxWidth: 300 }}>
              This worker will now be recognized automatically when they approach the camera for clock-in/out.
            </p>
            <button onClick={onClose} style={primaryBtn}><Check size={12} /> Done</button>
          </div>
        )}

        {/* ── ENROLL: ERROR ─────────────────────────────────────── */}
        {mode === 'enroll' && enrollStep === 'error' && (
          <div style={{ padding: 36, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--red-dim)', border: '2px solid var(--red-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={24} style={{ color: 'var(--red)' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)', margin: 0 }}>{enrollError || 'Enrollment failed'}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setCapturedImage(null); setEnrollStep('camera'); setEnrollError(''); startCamera() }} style={secondaryBtn}><RotateCcw size={12} /> Try Again</button>
              <button onClick={onClose} style={secondaryBtn}>Close</button>
            </div>
          </div>
        )}

        {/* ── RECOGNIZE: SCANNING ───────────────────────────────── */}
        {mode === 'recognize' && recStep === 'scanning' && (
          <>
            <div style={{ position: 'relative', background: '#000', aspectRatio: '4/3', maxHeight: 360 }}>
              <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Animated face oval */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ width: 190, height: 230, borderRadius: '50%', border: '2px solid var(--cyan)', opacity: 0.8, boxShadow: '0 0 30px rgba(0,208,255,0.3)', animation: 'pulse 2s ease-in-out infinite' }} />
              </div>

              {/* Action badge */}
              <div style={{ position: 'absolute', top: 14, left: 14 }}>
                <div style={{ background: actionBg, border: `1px solid ${actionBorder}`, borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: actionColor, animation: 'pulse 1s ease infinite' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: actionColor, fontWeight: 600 }}>{actionLabel.toUpperCase()} MODE</span>
                </div>
              </div>

              {/* Scan message */}
              <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.7)', borderRadius: 20, padding: '5px 16px' }}>
                  <Loader2 size={11} style={{ color: 'var(--cyan)', animation: 'spin 1.2s linear infinite' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>{scanMsg}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={secondaryBtn}>Cancel</button>
            </div>
          </>
        )}

        {/* ── RECOGNIZE: SUCCESS ────────────────────────────────── */}
        {mode === 'recognize' && recStep === 'success' && recResult?.data && (
          <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Worker card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: actionBg, border: `1px solid ${actionBorder}`, borderRadius: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-elevated)', border: `2px solid ${actionColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: actionColor, flexShrink: 0 }}>
                {recResult.data.worker.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: actionColor, margin: '0 0 2px' }}>{recResult.data.worker.name}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 2px' }}>{recResult.data.worker.workerCode} · {recResult.data.worker.department}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  <Check size={11} style={{ color: actionColor }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: actionColor, fontWeight: 600 }}>
                    {recResult.data.action === 'already_clocked_in' ? 'Already Clocked In Today'
                      : recResult.data.action === 'already_clocked_out' ? 'Already Clocked Out Today'
                      : recResult.data.action === 'clocked_in' ? 'Clocked In Successfully'
                      : 'Clocked Out Successfully'}
                  </span>
                </div>
              </div>
            </div>

            {/* Time + Confidence */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>TIME</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Building2 size={11} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>CONFIDENCE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: recResult.data.confidence >= 0.8 ? 'var(--green)' : 'var(--amber)' }}>
                    {(recResult.data.confidence * 100).toFixed(0)}%
                  </span>
                  <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${recResult.data.confidence * 100}%`, height: '100%', background: recResult.data.confidence >= 0.8 ? 'var(--green)' : 'var(--amber)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={handleScanAnother} style={secondaryBtn}><RotateCcw size={12} /> Scan Another</button>
              <button onClick={onClose} style={primaryBtn}><Check size={12} /> Done</button>
            </div>
          </div>
        )}

        {/* ── RECOGNIZE: ERROR ──────────────────────────────────── */}
        {mode === 'recognize' && recStep === 'error' && (
          <div style={{ padding: 30, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--red-dim)', border: '2px solid var(--red-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={22} style={{ color: 'var(--red)' }} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--red)', margin: '0 0 6px' }}>Could Not Recognize</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{recResult?.error || 'No enrolled face matched. Please enroll this worker first.'}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleScanAnother} style={secondaryBtn}><RotateCcw size={12} /> Try Again</button>
              <button onClick={onClose} style={secondaryBtn}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', fontWeight: 500,
}
const inputStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)', fontSize: 12, borderRadius: 8, padding: '8px 12px', outline: 'none', width: '100%', boxSizing: 'border-box',
}
const primaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
  background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)', color: 'var(--cyan)',
  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
}
const secondaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
  fontFamily: 'var(--font-mono)', fontSize: 11,
}
