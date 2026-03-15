import apiClient from '../client'
import { API } from '../endpoints'
import type { AdminUser, AuditLogEntry, PaginatedResponse, ApiResponse } from '../types'

export const adminService = {
  async listUsers(): Promise<AdminUser[]> {
    const { data } = await apiClient.get<ApiResponse<AdminUser[]>>(API.ADMIN.USERS_LIST)
    return data.data
  },

  async createUser(dto: {
    name: string; email: string; password: string; role: string; department?: string
  }): Promise<AdminUser> {
    const { data } = await apiClient.post<ApiResponse<AdminUser>>(API.ADMIN.USERS_CREATE, dto)
    return data.data
  },

  async updateUser(id: string, dto: Partial<AdminUser>): Promise<AdminUser> {
    const { data } = await apiClient.put<ApiResponse<AdminUser>>(API.ADMIN.USERS_UPDATE(id), dto)
    return data.data
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(API.ADMIN.USERS_DELETE(id))
  },

  async auditLog(params?: { page?: number; limit?: number; adminId?: string; action?: string }) {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<AuditLogEntry>>>(API.ADMIN.AUDIT_LOG, { params })
    return data.data
  },

  async resetPassword(id: string, newPassword: string): Promise<void> {
    await apiClient.post(API.ADMIN.RESET_PASSWORD(id), { newPassword })
  },
}
