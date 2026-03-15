'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/api/types'

const ROLE_LEVEL: Record<UserRole, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  SUPERVISOR: 2,
  VIEWER: 1,
}

export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    if (!store.isAuthenticated) {
      store.hydrate()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function canAccess(requiredRole: UserRole): boolean {
    if (!store.user) return false
    return (ROLE_LEVEL[store.user.role] ?? 0) >= (ROLE_LEVEL[requiredRole] ?? 0)
  }

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login: store.login,
    logout: store.logout,
    role: store.user?.role ?? null,
    canAccess,
  }
}
