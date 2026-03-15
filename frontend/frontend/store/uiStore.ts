import { create } from 'zustand'

interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

interface UiState {
  sidebarOpen: boolean
  mobileSidebarOpen: boolean
  activeModal: string | null
  notifications: Notification[]

  toggleSidebar: () => void
  setSidebarOpen: (v: boolean) => void
  setMobileSidebar: (v: boolean) => void
  openModal: (id: string) => void
  closeModal: () => void
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
}

const SIDEBAR_KEY = 'ppe_sidebar_open'

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: typeof window !== 'undefined' ? localStorage.getItem(SIDEBAR_KEY) !== 'false' : true,
  mobileSidebarOpen: false,
  activeModal: null,
  notifications: [],

  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarOpen
      localStorage.setItem(SIDEBAR_KEY, String(next))
      return { sidebarOpen: next }
    }),

  setSidebarOpen: (v) => {
    localStorage.setItem(SIDEBAR_KEY, String(v))
    set({ sidebarOpen: v })
  },

  setMobileSidebar: (mobileSidebarOpen) => set({ mobileSidebarOpen }),

  openModal: (activeModal) => set({ activeModal }),

  closeModal: () => set({ activeModal: null }),

  addNotification: (n) =>
    set((s) => ({
      notifications: [
        {
          ...n,
          id: crypto.randomUUID(),
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...s.notifications,
      ].slice(0, 50), // keep last 50
    })),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  clearNotifications: () => set({ notifications: [] }),
}))
