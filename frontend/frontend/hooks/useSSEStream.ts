'use client'
import { useEffect, useRef, useState } from 'react'
import { useJobStore } from '@/store/jobStore'
import type { ProgressEvent, FrameEvent, CompletedEvent, ErrorEvent } from '@/api/types'
import { API } from '@/api/endpoints'

const MAX_RETRIES = 3
const RETRY_DELAY = 2000

export function useSSEStream(jobId: string | null) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const esRef = useRef<EventSource | null>(null)
  const retriesRef = useRef(0)
  const store = useJobStore()

  useEffect(() => {
    if (!jobId) return

    function connect() {
      const es = new EventSource(API.JOBS.STREAM(jobId!))
      esRef.current = es

      es.addEventListener('open', () => {
        setConnected(true)
        setError(null)
        retriesRef.current = 0
        store.setSseConnected(true)
      })

      es.addEventListener('progress', (e: MessageEvent) => {
        try {
          const d = JSON.parse(e.data) as ProgressEvent
          store.updateProgress(d.processed, d.total, d.progress)
          store.setAppState('RUNNING')
        } catch { /* ignore */ }
      })

      es.addEventListener('frame', (e: MessageEvent) => {
        try {
          const d = JSON.parse(e.data) as FrameEvent
          store.updateFrame(d.image_base64, d.frame_index, d.workers_in_frame)
        } catch { /* ignore */ }
      })

      es.addEventListener('completed', (e: MessageEvent) => {
        try {
          const d = JSON.parse(e.data) as CompletedEvent
          const { metrics, classCounts, workerSummaries, safetyRows, reportText, emailStatus } = d.result
          store.setResults(metrics, classCounts, workerSummaries, { safetyRows, reportText, emailStatus })
          store.setAppState('COMPLETED')
          store.setSseConnected(false)
          setConnected(false)
          es.close()
        } catch { /* ignore */ }
      })

      es.addEventListener('error', (e: MessageEvent) => {
        try {
          const d = JSON.parse(e.data) as ErrorEvent
          store.setError(d.message)
        } catch { /* likely connection error — not JSON */ }
      })

      es.onerror = () => {
        es.close()
        setConnected(false)
        store.setSseConnected(false)

        if (retriesRef.current < MAX_RETRIES) {
          retriesRef.current++
          setTimeout(connect, RETRY_DELAY)
        } else {
          setError('Stream connection lost after multiple retries')
          store.setAppState('FAILED')
        }
      }
    }

    connect()

    return () => {
      esRef.current?.close()
      esRef.current = null
      setConnected(false)
      store.setSseConnected(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId])

  return { connected, error }
}
