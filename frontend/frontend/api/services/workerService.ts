import apiClient from '../client'
import { API } from '../endpoints'
import type {
  Worker, WorkerCreateDTO, PaginatedResponse, ApiResponse,
  AttendanceRecord, WorkerPpeSummary, ViolationFrame,
  FaceDetectionLog, SafetyScore,
} from '../types'

export const workerService = {
  async list(params?: { search?: string; department?: string; status?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Worker>>>(API.WORKERS.LIST, { params })
    return data.data
  },

  async create(dto: WorkerCreateDTO): Promise<Worker> {
    const { data } = await apiClient.post<ApiResponse<Worker>>(API.WORKERS.CREATE, dto)
    return data.data
  },

  async get(id: string): Promise<Worker> {
    const { data } = await apiClient.get<ApiResponse<Worker>>(API.WORKERS.GET(id))
    return data.data
  },

  async update(id: string, dto: Partial<WorkerCreateDTO>): Promise<Worker> {
    const { data } = await apiClient.put<ApiResponse<Worker>>(API.WORKERS.UPDATE(id), dto)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API.WORKERS.DELETE(id))
  },

  async getAttendance(id: string, params?: { startDate?: string; endDate?: string }) {
    const { data } = await apiClient.get<ApiResponse<AttendanceRecord[]>>(API.WORKERS.ATTENDANCE(id), { params })
    return data.data
  },

  async getPpeSummary(id: string, params?: { startDate?: string; endDate?: string }) {
    const { data } = await apiClient.get<ApiResponse<WorkerPpeSummary[]>>(API.WORKERS.PPE_SUMMARY(id), { params })
    return data.data
  },

  async getViolations(id: string, params?: { page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ViolationFrame>>>(API.WORKERS.VIOLATIONS(id), { params })
    return data.data
  },

  async getFaceLog(id: string, params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<FaceDetectionLog>>>(API.WORKERS.FACE_LOG(id), { params })
    return data.data
  },

  async getSafetyScore(id: string): Promise<SafetyScore[]> {
    const { data } = await apiClient.get<ApiResponse<SafetyScore[]>>(API.WORKERS.SAFETY_SCORE(id))
    return data.data
  },

  async enrollFace(id: string, photoUrl: string): Promise<void> {
    await apiClient.post(API.WORKERS.ENROLL_FACE(id), { photo_url: photoUrl })
  },
}
