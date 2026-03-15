'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function CtaSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement!
    canvas.width = parent.offsetWidth
    canvas.height = parent.offsetHeight
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = []
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5, alpha: Math.random() * 0.4 + 0.1,
      })
    }

    let animId: number
    const tick = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = '#00d4ff'
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      })
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <section id="cta-section" style={{ padding: '120px 48px', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      {/* Particles canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
        <h2 className="cta-h2" style={{ marginBottom: 24 }}>
          Ready to Eliminate<br /><span className="text-gradient-hero">Blind Spots</span>?
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--t2)', lineHeight: 1.7, marginBottom: 40 }}>
          Start your free analysis today. No setup fee. No credit card required. Your first 3 jobs are on us.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
          <Link href="/ppe" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 15, color: '#03040a', background: 'var(--cyan)', borderRadius: 8, padding: '18px 44px', textDecoration: 'none', fontWeight: 600, transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >Upload Your First Video <span>→</span></Link>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--t1)', background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)', borderRadius: 8, padding: '18px 44px', textDecoration: 'none', transition: 'border-color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--cyan)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
          >Schedule a Live Demo</Link>
        </div>

        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--t3)' }}>
          {['✓ Free for first 3 analyses', '✓ No credit card', '✓ Setup in 5 minutes'].map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
