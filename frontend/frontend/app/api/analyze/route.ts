import { NextRequest, NextResponse } from 'next/server'
import type { AnalysisResponse } from '@/api/types'

// TODO: Replace mock with real AI service proxy once Python backend is ready
// The Python service endpoint is: process.env.AI_API_BASE_URL + '/analyze'

function buildMockResponse(recipientEmail: string): AnalysisResponse {
  return {
    output_video_url: '/api/video/mock-output',
    frames_done: 1240,
    missing_frames: 87,
    total_workers_tracked: 5,
    max_people: 8,
    worker_rows: [
      { worker: 'Worker-1', missing_items: 'NO-Hardhat', frames_seen: 340, missing_events: 12 },
      { worker: 'Worker-2', missing_items: '', frames_seen: 410, missing_events: 0 },
      { worker: 'Worker-3', missing_items: 'NO-Safety Vest, NO-Mask', frames_seen: 290, missing_events: 31 },
      { worker: 'Worker-4', missing_items: 'NO-Hardhat', frames_seen: 120, missing_events: 8 },
      { worker: 'Worker-5', missing_items: '', frames_seen: 380, missing_events: 0 },
    ],
    safety_rows: [
      { worker: 'Worker-1', score: 78, violations: 12, late_arrivals: 1, absence: 0, compliance_bonus: 5, risk_level: 'Medium' },
      { worker: 'Worker-2', score: 98, violations: 0, late_arrivals: 0, absence: 0, compliance_bonus: 10, risk_level: 'Low' },
      { worker: 'Worker-3', score: 52, violations: 31, late_arrivals: 2, absence: 1, compliance_bonus: 0, risk_level: 'High' },
      { worker: 'Worker-4', score: 71, violations: 8, late_arrivals: 0, absence: 0, compliance_bonus: 3, risk_level: 'Medium' },
      { worker: 'Worker-5', score: 95, violations: 0, late_arrivals: 1, absence: 0, compliance_bonus: 8, risk_level: 'Low' },
    ],
    report_text: `PPE COMPLIANCE ANALYSIS REPORT\n${'─'.repeat(40)}\nGenerated: ${new Date().toISOString()}\n\nTotal Frames Processed : 1240\nFrames With Missing PPE: 87 (7.0%)\nTotal Workers Tracked  : 5\nPeak People In Frame   : 8\n\nWORKER SUMMARY\n─────────────\nWorker-1: 12 missing events (NO-Hardhat) · Score: 78 · Risk: Medium\nWorker-2:  0 missing events              · Score: 98 · Risk: Low\nWorker-3: 31 missing events (NO-Safety Vest, NO-Mask) · Score: 52 · Risk: High\nWorker-4:  8 missing events (NO-Hardhat) · Score: 71 · Risk: Medium\nWorker-5:  0 missing events              · Score: 95 · Risk: Low\n\nSAFETY FORMULA: score = 100 - (violations × 3) - (late_arrivals × 2) - (absence × 5) + compliance_bonus\n\nRECOMMENDATIONS\n───────────────\n• Worker-3 requires immediate PPE compliance intervention\n• Ensure hardhat compliance for Workers 1 and 4\n• Overall site compliance rate: 61.3%`,
    auto_email_status: recipientEmail
      ? { ok: true, recipient: recipientEmail, status_code: 200, body: 'Email sent successfully' }
      : { ok: false, recipient: '', error: 'No recipient email provided' },
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData()
    const recipientEmail = (formData.get('recipient_email') as string) ?? ''

    const aiBaseUrl = process.env.AI_API_BASE_URL
    if (aiBaseUrl) {
      // Proxy to real Python AI service
      const aiResponse = await fetch(`${aiBaseUrl}/analyze`, {
        method: 'POST',
        body: formData,
      })
      const data = await aiResponse.json()
      return NextResponse.json(data)
    }

    // Simulate processing delay (remove in production)
    await new Promise<void>((resolve) => setTimeout(resolve, 2000))

    return NextResponse.json(buildMockResponse(recipientEmail))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
