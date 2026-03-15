import apiClient from '../client'
import { API } from '../endpoints'
import type {
  DashboardKPIs, AttendanceTrendPoint, PpeCategoryCompliance,
  ViolationTrendPoint, SafetyDistribution, ActivityFeedItem, ApiResponse,
} from '../types'

export const dashboardService = {
  async kpis(): Promise<DashboardKPIs> {
    const { data } = await apiClient.get<ApiResponse<DashboardKPIs>>(API.DASHBOARD.KPIS)
    return data.data
  },

  async attendanceTrend(days = 7): Promise<AttendanceTrendPoint[]> {
    const { data } = await apiClient.get<ApiResponse<AttendanceTrendPoint[]>>(
      API.DASHBOARD.ATTENDANCE_TREND, { params: { days } }
    )
    return data.data
  },

  async ppeByCategory(): Promise<PpeCategoryCompliance[]> {
    const { data } = await apiClient.get<ApiResponse<PpeCategoryCompliance[]>>(API.DASHBOARD.PPE_BY_CATEGORY)
    return data.data
  },

  async violationsTrend(days = 30): Promise<ViolationTrendPoint[]> {
    const { data } = await apiClient.get<ApiResponse<ViolationTrendPoint[]>>(
      API.DASHBOARD.VIOLATIONS_TREND, { params: { days } }
    )
    return data.data
  },

  async safetyDistribution(): Promise<SafetyDistribution> {
    const { data } = await apiClient.get<ApiResponse<SafetyDistribution>>(API.DASHBOARD.SAFETY_DISTRIBUTION)
    return data.data
  },

  async activityFeed(limit = 10): Promise<ActivityFeedItem[]> {
    const { data } = await apiClient.get<ApiResponse<ActivityFeedItem[]>>(
      API.DASHBOARD.ACTIVITY_FEED, { params: { limit } }
    )
    return data.data
  },
}
