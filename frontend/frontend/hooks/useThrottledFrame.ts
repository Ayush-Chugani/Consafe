'use client'
import { useState, useRef, useEffect } from 'react'
import { useJobStore } from '@/store/jobStore'

const TARGET_FPS = 10
const FRAME_INTERVAL = 1000 / TARGET_FPS

/**
 * Returns throttled frame data from the job store at a maximum of 10 FPS.
 * This prevents excessive re-renders when frames arrive faster than the
 * display refresh rate.
 */
export function useThrottledFrame() {
  const currentFrameData = useJobStore((s) => s.currentFrameData)
  const frameIndex = useJobStore((s) => s.frameIndex)
  const workersInFrame = useJobStore((s) => s.workersInFrame)

  const [throttledData, setThrottledData] = useState<{
    frameData: string | null
    frameIndex: number
    workersInFrame: typeof workersInFrame
  }>({
    frameData: null,
    frameIndex: 0,
    workersInFrame: [],
  })

  const lastUpdateRef = useRef<number>(0)
  const pendingRef = useRef<{
    frameData: string | null
    frameIndex: number
    workersInFrame: typeof workersInFrame
  } | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const now = performance.now()
    const elapsed = now - lastUpdateRef.current

    const incoming = { frameData: currentFrameData, frameIndex, workersInFrame }

    if (elapsed >= FRAME_INTERVAL) {
      lastUpdateRef.current = now
      setThrottledData(incoming)
      pendingRef.current = null
    } else {
      // Store as pending and schedule an update
      pendingRef.current = incoming
      cancelAnimationFrame(rafRef.current)

      const delay = FRAME_INTERVAL - elapsed
      const timeoutId = setTimeout(() => {
        if (pendingRef.current) {
          lastUpdateRef.current = performance.now()
          setThrottledData(pendingRef.current)
          pendingRef.current = null
        }
      }, delay)

      return () => clearTimeout(timeoutId)
    }
  }, [currentFrameData, frameIndex, workersInFrame])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return throttledData
}
