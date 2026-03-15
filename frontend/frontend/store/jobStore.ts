import { create } from 'zustand'
import type { AnalyzeRequest, PpeMetrics, PpeClassCount, WorkerPpeSummary, WorkerInFrame, SafetyRow, EmailStatus } from '@/api/types'

type AppState = 'IDLE' | 'UPLOADING' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED'

const DEFAULT_SETTINGS: AnalyzeRequest = {
  conf_threshold: 0.25,
  iou_threshold: 0.45,
  preview_stride: 10,
  preview_width: 640,
  draw_center_points: false,
  stationary_seconds_threshold: 3,
}

interface JobState {
  // File
  file: File | null
  fileName: string
  fileSize: number

  // Settings
  settings: AnalyzeRequest

  // Job execution
  jobId: string | null
  appState: AppState
  errorMessage: string | null

  // Progress
  progress: number
  totalFrames: number
  processedFrames: number

  // Live frame
  currentFrameData: string | null
  frameIndex: number
  workersInFrame: WorkerInFrame[]

  // Results
  metrics: PpeMetrics | null
  classCounts: PpeClassCount[]
  workerSummary: WorkerPpeSummary[]
  safetyRows: SafetyRow[]
  reportText: string | null
  emailStatus: EmailStatus | null

  // SSE
  sseConnected: boolean

  // Form inputs (safety scoring + email)
  lateArrivalsText: string
  absenceText: string
  recipientEmail: string

  // Actions
  setFile: (file: File) => void
  clearFile: () => void
  updateSettings: (patch: Partial<AnalyzeRequest>) => void
  setFormInputs: (patch: { lateArrivalsText?: string; absenceText?: string; recipientEmail?: string }) => void
  setJobId: (id: string) => void
  setAppState: (state: AppState) => void
  setError: (msg: string) => void
  updateProgress: (processed: number, total: number, progress: number) => void
  updateFrame: (base64: string, index: number, workers: WorkerInFrame[]) => void
  setResults: (
    metrics: PpeMetrics,
    classCounts: PpeClassCount[],
    workerSummary: WorkerPpeSummary[],
    extended?: { safetyRows?: SafetyRow[]; reportText?: string; emailStatus?: EmailStatus }
  ) => void
  setSseConnected: (v: boolean) => void
  reset: () => void
}

export const useJobStore = create<JobState>((set) => ({
  file: null,
  fileName: '',
  fileSize: 0,
  settings: { ...DEFAULT_SETTINGS },
  jobId: null,
  appState: 'IDLE',
  errorMessage: null,
  progress: 0,
  totalFrames: 0,
  processedFrames: 0,
  currentFrameData: null,
  frameIndex: 0,
  workersInFrame: [],
  metrics: null,
  classCounts: [],
  workerSummary: [],
  safetyRows: [],
  reportText: null,
  emailStatus: null,
  sseConnected: false,
  lateArrivalsText: '',
  absenceText: '',
  recipientEmail: '',

  setFile: (file) => set({ file, fileName: file.name, fileSize: file.size }),
  clearFile: () => set({ file: null, fileName: '', fileSize: 0 }),
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
  setJobId: (jobId) => set({ jobId }),
  setAppState: (appState) => set({ appState }),
  setError: (errorMessage) => set({ errorMessage, appState: 'FAILED' }),

  updateProgress: (processedFrames, totalFrames, progress) =>
    set({ processedFrames, totalFrames, progress }),

  updateFrame: (currentFrameData, frameIndex, workersInFrame) =>
    set({ currentFrameData, frameIndex, workersInFrame }),

  setFormInputs: (patch) => set((s) => ({ ...s, ...patch })),

  setResults: (metrics, classCounts, workerSummary, extended) =>
    set({
      metrics, classCounts, workerSummary,
      safetyRows: extended?.safetyRows ?? [],
      reportText: extended?.reportText ?? null,
      emailStatus: extended?.emailStatus ?? null,
    }),

  setSseConnected: (sseConnected) => set({ sseConnected }),

  reset: () =>
    set({
      file: null, fileName: '', fileSize: 0,
      settings: { ...DEFAULT_SETTINGS },
      jobId: null, appState: 'IDLE', errorMessage: null,
      progress: 0, totalFrames: 0, processedFrames: 0,
      currentFrameData: null, frameIndex: 0, workersInFrame: [],
      metrics: null, classCounts: [], workerSummary: [],
      safetyRows: [], reportText: null, emailStatus: null,
      sseConnected: false,
      lateArrivalsText: '', absenceText: '', recipientEmail: '',
    }),
}))
