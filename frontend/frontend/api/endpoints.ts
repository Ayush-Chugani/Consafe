const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || 'http://localhost:8000'

export const API = {
  BASE: API_BASE,

  AUTH: {
    LOGIN:   `${API_BASE}/api/v1/auth/login`,
    LOGOUT:  `${API_BASE}/api/v1/auth/logout`,
    REFRESH: `${API_BASE}/api/v1/auth/refresh`,
    ME:      `${API_BASE}/api/v1/auth/me`,
  },

  WORKERS: {
    LIST:         `${API_BASE}/api/v1/workers`,
    CREATE:       `${API_BASE}/api/v1/workers`,
    GET:          (id: string) => `${API_BASE}/api/v1/workers/${id}`,
    UPDATE:       (id: string) => `${API_BASE}/api/v1/workers/${id}`,
    DELETE:       (id: string) => `${API_BASE}/api/v1/workers/${id}`,
    ATTENDANCE:   (id: string) => `${API_BASE}/api/v1/workers/${id}/attendance`,
    PPE_SUMMARY:  (id: string) => `${API_BASE}/api/v1/workers/${id}/ppe-summary`,
    VIOLATIONS:   (id: string) => `${API_BASE}/api/v1/workers/${id}/violations`,
    FACE_LOG:     (id: string) => `${API_BASE}/api/v1/workers/${id}/face-log`,
    SAFETY_SCORE: (id: string) => `${API_BASE}/api/v1/workers/${id}/safety-score`,
    ENROLL_FACE:  (id: string) => `${API_BASE}/api/v1/workers/${id}/enroll-face`,
  },

  ATTENDANCE: {
    LIST:      `${API_BASE}/api/v1/attendance`,
    SUMMARY:   `${API_BASE}/api/v1/attendance/summary`,
    TREND:     `${API_BASE}/api/v1/attendance/trend`,
    LOG:       `${API_BASE}/api/v1/attendance/log`,
    RECOGNIZE: `${API_BASE}/api/v1/attendance/recognize`,
    GET:       (id: string) => `${API_BASE}/api/v1/attendance/${id}`,
    UPDATE:    (id: string) => `${API_BASE}/api/v1/attendance/${id}`,
    FLAG:      (id: string) => `${API_BASE}/api/v1/attendance/${id}/flag`,
  },

  JOBS: {
    ANALYZE:  `${API_BASE}/api/v1/videos/analyze`,
    LIST:     `${API_BASE}/api/v1/jobs`,
    GET:      (id: string) => `${API_BASE}/api/v1/jobs/${id}`,
    STREAM:   (id: string) => `${API_BASE}/api/v1/jobs/${id}/stream`,
    RESULT:   (id: string) => `${API_BASE}/api/v1/jobs/${id}/result`,
    RAW_RESULT: (id: string) => `${API_BASE}/api/v1/jobs/${id}/raw_result`,
    DOWNLOAD: (id: string) => `${API_BASE}/api/v1/jobs/${id}/download`,
    DELETE:   (id: string) => `${API_BASE}/api/v1/jobs/${id}`,
    FRAMES:   (id: string) => `${API_BASE}/api/v1/jobs/${id}/frames`,
    WORKERS:  (id: string) => `${API_BASE}/api/v1/jobs/${id}/workers`,
  },

  DASHBOARD: {
    KPIS:                `${API_BASE}/api/v1/dashboard/kpis`,
    ATTENDANCE_TREND:    `${API_BASE}/api/v1/dashboard/attendance-trend`,
    PPE_BY_CATEGORY:     `${API_BASE}/api/v1/dashboard/ppe-by-category`,
    VIOLATIONS_TREND:    `${API_BASE}/api/v1/dashboard/violations-trend`,
    SAFETY_DISTRIBUTION: `${API_BASE}/api/v1/dashboard/safety-distribution`,
    ACTIVITY_FEED:       `${API_BASE}/api/v1/dashboard/activity-feed`,
  },

  REPORTS: {
    GENERATE:         `${API_BASE}/api/v1/reports/generate`,
    SCHEDULED_LIST:   `${API_BASE}/api/v1/reports/scheduled`,
    SCHEDULED_CREATE: `${API_BASE}/api/v1/reports/scheduled`,
    SCHEDULED_UPDATE: (id: string) => `${API_BASE}/api/v1/reports/scheduled/${id}`,
    SCHEDULED_DELETE: (id: string) => `${API_BASE}/api/v1/reports/scheduled/${id}`,
  },

  ADMIN: {
    USERS_LIST:      `${API_BASE}/api/v1/admin/users`,
    USERS_CREATE:    `${API_BASE}/api/v1/admin/users`,
    USERS_GET:       (id: string) => `${API_BASE}/api/v1/admin/users/${id}`,
    USERS_UPDATE:    (id: string) => `${API_BASE}/api/v1/admin/users/${id}`,
    USERS_DELETE:    (id: string) => `${API_BASE}/api/v1/admin/users/${id}`,
    AUDIT_LOG:       `${API_BASE}/api/v1/admin/audit-log`,
    RESET_PASSWORD:  (id: string) => `${API_BASE}/api/v1/admin/users/${id}/reset-password`,
  },
} as const
