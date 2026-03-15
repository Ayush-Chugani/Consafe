import apiClient from '../client'
import { API } from '../endpoints'
import type { AuthResponse, LoginDTO, AdminUser, ApiResponse } from '../types'

export const authService = {
  async login(dto: LoginDTO): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(API.AUTH.LOGIN, dto)
    return data.data
  },

  async logout(): Promise<void> {
    await apiClient.post(API.AUTH.LOGOUT)
  },

  async refresh(): Promise<{ accessToken: string }> {
    const { data } = await apiClient.post<ApiResponse<{ accessToken: string }>>(API.AUTH.REFRESH)
    return data.data
  },

  async me(): Promise<AdminUser> {
    const { data } = await apiClient.get<ApiResponse<AdminUser>>(API.AUTH.ME)
    return data.data
  },
}
