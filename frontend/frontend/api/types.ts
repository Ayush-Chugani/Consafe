// ─── Auth ────────────────────────────────────────────────────
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPERVISOR' | 'VIEWER'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: Pick<AdminUser, 'id' | 'name' | 'email' | 'role' | 'avatarUrl'>
}

export interface LoginDTO { email: string; password: string }

// ─── Workers ─────────────────────────────────────────────────
export interface Worker {
  id: string
  workerCode: string
  name: string
  department: string
  jobTitle: string
  siteLocation: string
  faceEmbeddingId: string | null
  referencePhotoUrl: string | null
  enrolledAt: string | null
  isActive: boolean
  safetyScore: number
  createdAt: string
  updatedAt: string
}

export interface WorkerCreateDTO {
  workerCode: string
  name: string
  department: string
  jobTitle: string
  siteLocation: string
}

// ─── Attendance ──────────────────────────────────────────────
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'on_leave'

export interface AttendanceRecord {
  id: string
  workerId: string
  worker?: Pick<Worker, 'id' | 'name' | 'workerCode' | 'department' | 'referencePhotoUrl'>
  date: string
  clockInTime: string | null
  clockOutTime: string | null
  clockInProofUrl: string | null
  clockOutProofUrl: string | null
  clockInConfidence: number | null
  clockOutConfidence: number | null
  clockInCameraId: string | null
  clockOutCameraId: string | null
  status: AttendanceStatus
  durationMinutes: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface AttendanceSummary {
  present: number
  absent: number
  late: number
  onLeave: number
  total: number
}

export interface AttendanceTrendPoint {
  date: string
  present: number
  absent: number
  late: number
}

export interface FaceDetectionResultDTO {
  workerId: string
  cameraId: string
  confidence: number
  frameJpegUrl: string
  detectedAt: string
  jobId?: string
}

// ─── PPE Jobs ────────────────────────────────────────────────
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface PpeJob {
  id: string
  submittedBy: string
  originalFilename: string
  fileSizeBytes: number
  status: JobStatus
  confThreshold: number
  iouThreshold: number
  drawPoints: boolean
  previewStride: number
  previewWidth: number
  totalFrames: number | null
  processedFrames: number | null
  progress: number
  startedAt: string | null
  completedAt: string | null
  outputVideoUrl: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export interface PpeMetrics {
  processedFrames: number
  framesWithMissingPpe: number
  maxPeopleInFrame: number
}

export interface PpeClassCount { className: string; count: number }

export interface WorkerPpeSummary {
  id: string
  jobId: string
  workerId: string | null
  workerLabel: string
  missingItems: string
  framesSeen: number
  missingEvents: number
}

export interface ViolationFrame {
  id: string
  jobId: string
  workerId: string | null
  frameIndex: number
  frameTimestamp: number
  frameJpegUrl: string
  missingItems: string
  confidenceScore: number
  cameraId: string | null
  createdAt: string
  worker?: Pick<Worker, 'id' | 'name' | 'workerCode'>
}

export interface JobResult {
  job: PpeJob
  metrics: PpeMetrics
  classCounts: PpeClassCount[]
  workerSummaries: WorkerPpeSummary[]
  violationFrames: ViolationFrame[]
  safetyRows?: SafetyRow[]
  reportText?: string
  emailStatus?: EmailStatus
}

// SSE Events
export interface ProgressEvent  { type: 'progress'; processed: number; total: number; progress: number }
export interface FrameEvent     { type: 'frame'; frame_index: number; image_base64: string; workers_in_frame: WorkerInFrame[] }
export interface CompletedEvent { type: 'completed'; result: JobResult }
export interface ErrorEvent     { type: 'error'; message: string }
export type StreamEvent = ProgressEvent | FrameEvent | CompletedEvent | ErrorEvent

export interface WorkerInFrame {
  id: string
  missing_items: string[]
  compliant: boolean
}

// ─── Safety Scoring ──────────────────────────────────────────
export interface WorkerRow {
  worker: string
  missing_items: string
  frames_seen: number
  missing_events: number
}

export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface SafetyRow {
  worker: string
  score: number
  violations: number
  late_arrivals: number
  absence: number
  compliance_bonus: number
  risk_level: RiskLevel
}

export interface EmailStatus {
  ok: boolean
  recipient: string
  status_code?: number
  body?: string
  error?: string
}

// ─── Analyze Request ─────────────────────────────────────────
export interface AnalyzeRequest {
  conf_threshold: number
  iou_threshold: number
  preview_stride: number
  preview_width: number
  draw_center_points: boolean
  stationary_seconds_threshold?: number
  late_arrivals_text?: string
  absence_text?: string
  recipient_email?: string
}

// ─── Dashboard ───────────────────────────────────────────────
export interface DashboardKPIs {
  onSite: number
  onSiteTotal: number
  onSiteTrend: number
  complianceRate: number
  complianceTrend: number
  activeViolations: number
  violationsTrend: number
  jobsThisWeek: number
  jobsTrend: number
}

export interface PpeCategoryCompliance { category: string; compliance: number }
export interface ViolationTrendPoint   { date: string; total: number; resolved: number }

export interface SafetyDistribution {
  excellent: number   // >95%
  good: number        // 85–95%
  atRisk: number      // 70–85%
  critical: number    // <70%
  total: number
}

export type ActivityEventType =
  | 'FACE_DETECTED' | 'PPE_VIOLATION' | 'JOB_COMPLETED'
  | 'WORKER_ABSENT'  | 'WORKER_LATE'   | 'PPE_JOB_STARTED'

export interface ActivityFeedItem {
  id: string
  timestamp: string
  eventType: ActivityEventType
  description: string
  workerId: string | null
  workerName: string | null
  evidenceUrl: string | null
  jobId: string | null
}

// ─── Face Detection ──────────────────────────────────────────
export type MatchStatus = 'matched' | 'unmatched' | 'false_positive' | 'flagged'

export interface FaceDetectionLog {
  id: string
  workerId: string
  worker?: Pick<Worker, 'id' | 'name' | 'workerCode' | 'referencePhotoUrl'>
  detectedAt: string
  cameraId: string
  frameJpegUrl: string
  confidence: number
  matchStatus: MatchStatus
  attendanceRecordId: string | null
  jobId: string | null
  createdAt: string
}

// ─── Safety Scores ───────────────────────────────────────────
export interface SafetyScore {
  id: string
  workerId: string
  date: string
  score: number
  attendanceScore: number
  ppeComplianceScore: number
  punctualityScore: number
  violationCount: number
  framesAnalyzed: number
  createdAt: string
}

// ─── Reports ─────────────────────────────────────────────────
export type ReportType =
  | 'daily_attendance' | 'ppe_compliance' | 'worker_safety_score'
  | 'violation_proof'  | 'monthly_summary' | 'incident_report'

export type ReportFormat = 'pdf' | 'excel' | 'csv'

export interface ReportConfig {
  type: ReportType
  format: ReportFormat
  startDate: string
  endDate: string
  workerIds?: string[]
  departmentFilter?: string
  includeProofImages?: boolean
}

export interface ScheduledReport {
  id: string
  createdBy: string
  reportType: ReportType
  cronExpression: string
  recipients: string[]
  format: ReportFormat
  filters: ReportConfig
  isActive: boolean
  lastSentAt: string | null
  nextRunAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── Admin ───────────────────────────────────────────────────
export interface AuditLogEntry {
  id: string
  adminId: string
  admin?: Pick<AdminUser, 'id' | 'name' | 'email'>
  action: string
  resourceType: string
  resourceId: string | null
  oldValue: Record<string, unknown> | null
  newValue: Record<string, unknown> | null
  ipAddress: string
  userAgent: string
  createdAt: string
}

// ─── Direct Analysis (Python AI layer) ───────────────────────
export interface AnalysisResponse {
  output_video_url: string
  frames_done: number
  missing_frames: number
  total_workers_tracked: number
  max_people: number
  worker_rows: WorkerRow[]
  safety_rows: SafetyRow[]
  report_text: string
  auto_email_status: EmailStatus
}

export interface DirectAnalysisRequest {
  conf: number
  iou: number
  draw_points: boolean
  live_preview_stride: number
  late_arrivals_text: string
  absence_text: string
  recipient_email: string
}

// ─── Generic API ─────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
  message: string
}
