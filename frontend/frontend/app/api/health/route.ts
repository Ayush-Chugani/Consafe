import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
  const aiBaseUrl = process.env.AI_API_BASE_URL
  let aiStatus: 'online' | 'offline' | 'unconfigured' = 'unconfigured'

  if (aiBaseUrl) {
    try {
      const res = await fetch(`${aiBaseUrl}/health`, { signal: AbortSignal.timeout(3000) })
      aiStatus = res.ok ? 'online' : 'offline'
    } catch {
      aiStatus = 'offline'
    }
  }

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
    ai_service: aiStatus,
  })
}
