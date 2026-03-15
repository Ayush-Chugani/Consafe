import apiClient from '../client'
import { API } from '../endpoints'
import type { AttendanceRecord, AttendanceSummary, AttendanceTrendPoint, ApiResponse, PaginatedResponse } from '../types'

export const attendanceService = {
  async list(params?: { date?: string; status?: string; department?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<AttendanceRecord>>>(API.ATTENDANCE.LIST, { params })
    return data.data
  },

  async summary(date?: string): Promise<AttendanceSummary> {
    const { data } = await apiClient.get<ApiResponse<AttendanceSummary>>(API.ATTENDANCE.SUMMARY, { params: { date } })
    return data.data
  },

  async trend(days = 7): Promise<AttendanceTrendPoint[]> {
    const { data } = await apiClient.get<ApiResponse<AttendanceTrendPoint[]>>(API.ATTENDANCE.TREND, { params: { days } })
    return data.data
  },

  async update(id: string, dto: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const { data } = await apiClient.put<ApiResponse<AttendanceRecord>>(API.ATTENDANCE.UPDATE(id), dto)
    return data.data
  },

  async flag(id: string, reason: string): Promise<void> {
    await apiClient.post(API.ATTENDANCE.FLAG(id), { reason })
  },
}
