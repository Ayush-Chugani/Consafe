import apiClient from '../client'
import { API } from '../endpoints'
import type { ScheduledReport, ReportConfig, ApiResponse } from '../types'

export const reportService = {
  async generate(config: ReportConfig): Promise<{ downloadUrl: string }> {
    const { data } = await apiClient.post<ApiResponse<{ downloadUrl: string }>>(API.REPORTS.GENERATE, config)
    return data.data
  },

  async listScheduled(): Promise<ScheduledReport[]> {
    const { data } = await apiClient.get<ApiResponse<ScheduledReport[]>>(API.REPORTS.SCHEDULED_LIST)
    return data.data
  },

  async createScheduled(dto: Partial<ScheduledReport>): Promise<ScheduledReport> {
    const { data } = await apiClient.post<ApiResponse<ScheduledReport>>(API.REPORTS.SCHEDULED_CREATE, dto)
    return data.data
  },

  async updateScheduled(id: string, dto: Partial<ScheduledReport>): Promise<ScheduledReport> {
    const { data } = await apiClient.put<ApiResponse<ScheduledReport>>(API.REPORTS.SCHEDULED_UPDATE(id), dto)
    return data.data
  },

  async deleteScheduled(id: string): Promise<void> {
    await apiClient.delete(API.REPORTS.SCHEDULED_DELETE(id))
  },
}
