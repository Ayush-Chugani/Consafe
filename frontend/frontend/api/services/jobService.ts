import apiClient from '../client'
import { API } from '../endpoints'
import type { PpeJob, JobResult, ViolationFrame, WorkerPpeSummary, PaginatedResponse, ApiResponse, AnalyzeRequest, AnalysisResponse } from '../types'

export const jobService = {
  async analyze(file: File, settings: AnalyzeRequest): Promise<{ jobId: string }> {
    const form = new FormData()
    form.append('video', file)
    Object.entries(settings).forEach(([k, v]) => { if (v !== undefined && v !== '') form.append(k, String(v)) })
    const { data } = await apiClient.post<ApiResponse<{ jobId: string }>>(
      API.JOBS.ANALYZE, form, { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data.data
  },

  async list(params?: { status?: string; page?: number; limit?: number; startDate?: string; endDate?: string }) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<PpeJob>>>(API.JOBS.LIST, { params })
    return data.data
  },

  async get(id: string): Promise<PpeJob> {
    const { data } = await apiClient.get<ApiResponse<PpeJob>>(API.JOBS.GET(id))
    return data.data
  },

  async result(id: string): Promise<JobResult> {
    const { data } = await apiClient.get<ApiResponse<JobResult>>(API.JOBS.RESULT(id))
    return data.data
  },

  async rawResult(id: string): Promise<AnalysisResponse> {
    const { data } = await apiClient.get<AnalysisResponse>(API.JOBS.RAW_RESULT(id))
    if (data && data.output_video_url && data.output_video_url.startsWith('/')) {
      data.output_video_url = `${API.BASE}${data.output_video_url}`
    }
    return data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API.JOBS.DELETE(id))
  },

  async frames(id: string, params?: { worker_id?: string; page?: number }) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ViolationFrame>>>(API.JOBS.FRAMES(id), { params })
    return data.data
  },

  async workers(id: string): Promise<WorkerPpeSummary[]> {
    const { data } = await apiClient.get<ApiResponse<WorkerPpeSummary[]>>(API.JOBS.WORKERS(id))
    return data.data
  },

  getDownloadUrl(id: string): string {
    return API.JOBS.DOWNLOAD(id)
  },
}
