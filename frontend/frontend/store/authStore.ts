import { create } from 'zustand'
import { authService } from '@/api/services/authService'
import type { UserRole } from '@/api/types'

interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl: string | null
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  setToken: (token: string) => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  hydrate() {
    const token = sessionStorage.getItem('access_token')
    const userStr = sessionStorage.getItem('auth_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as AuthUser
        set({ user, accessToken: token, isAuthenticated: true })
      } catch { /* malformed JSON — ignore */ }
    }
  },

  setToken(token: string) {
    sessionStorage.setItem('access_token', token)
    set({ accessToken: token })
  },

  async login(email: string, password: string) {
    set({ isLoading: true })
    try {
      const res = await authService.login({ email, password })
      const { accessToken, user } = res
      sessionStorage.setItem('access_token', accessToken)
      sessionStorage.setItem('auth_user', JSON.stringify(user))
      set({ user, accessToken, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  async logout() {
    try { await authService.logout() } catch { /* best-effort */ }
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('auth_user')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  async refreshToken() {
    try {
      const { accessToken } = await authService.refresh()
      get().setToken(accessToken)
    } catch {
      await get().logout()
    }
  },
}))
