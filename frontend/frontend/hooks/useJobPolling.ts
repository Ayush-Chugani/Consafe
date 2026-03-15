'use client'
import { useEffect, useRef } from 'react'
import { useJobStore } from '@/store/jobStore'
import { jobService } from '@/api/services/jobService'

const POLL_INTERVAL = 2000

export function useJobPolling(jobId: string | null) {
  const { sseConnected, appState, setAppState, setError, updateProgress, setResults } = useJobStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const failCountRef = useRef(0)

  useEffect(() => {
    const isActive = appState === 'QUEUED' || appState === 'RUNNING'
    if (!jobId || sseConnected || !isActive) return

    async function poll() {
      try {
        const job = await jobService.get(jobId!)
        failCountRef.current = 0

        if (job.status === 'running') {
          setAppState('RUNNING')
          updateProgress(job.processedFrames ?? 0, job.totalFrames ?? 0, job.progress)
        } else if (job.status === 'completed') {
          const result = await jobService.result(jobId!)
          setResults(result.metrics, result.classCounts, result.workerSummaries, {
            safetyRows: result.safetyRows,
            reportText: result.reportText,
            emailStatus: result.emailStatus,
          })
          setAppState('COMPLETED')
          return
        } else if (job.status === 'failed') {
          setError(job.errorMessage ?? 'Job failed')
          return
        }

        timerRef.current = setTimeout(poll, POLL_INTERVAL)
      } catch {
        failCountRef.current++
        if (failCountRef.current >= 3) {
          setError('Lost connection to server')
        } else {
          timerRef.current = setTimeout(poll, POLL_INTERVAL * 2)
        }
      }
    }

    timerRef.current = setTimeout(poll, POLL_INTERVAL)
    return () => clearTimeout(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, sseConnected, appState])
}
