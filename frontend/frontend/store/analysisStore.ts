import { create } from 'zustand'
import type { AnalysisResponse } from '@/api/types'

export type AnalysisStatus = 'idle' | 'processing' | 'completed' | 'failed'

interface AnalysisState {
  status: AnalysisStatus
  result: AnalysisResponse | null
  error: string | null
  // Actions
  setProcessing: () => void
  setCompleted: (result: AnalysisResponse) => void
  setFailed: (error: string) => void
  reset: () => void
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  status: 'idle',
  result: null,
  error: null,

  setProcessing: () => set({ status: 'processing', result: null, error: null }),
  setCompleted: (result) => set({ status: 'completed', result, error: null }),
  setFailed: (error) => set({ status: 'failed', error }),
  reset: () => set({ status: 'idle', result: null, error: null }),
}))
