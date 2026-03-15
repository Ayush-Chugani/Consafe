'use client'
import { useEffect, useRef } from 'react'

const NOISE_BG = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")"

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || window.innerWidth < 480) return
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const count = window.innerWidth < 768 ? 80 : 180
    type Particle = { x: number; y: number; vx: number; vy: number; type: 0|1|2; phase: number; size: number }
    const particles: Particle[] = Array.from({ length: count }, () => {
      const t = Math.random() < 0.6 ? 0 : Math.random() < 0.625 ? 1 : 2
      return { x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3, type: t as 0|1|2, phase: Math.random()*Math.PI*2, size: t===0?1.5:t===1?2:2.5 }
    })
    const colors = ['#00ff88', '#f59e0b', '#ff3366']

    let animId: number
    let tick = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      tick += 0.016

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
        const size = p.type === 2 ? p.size * (0.8 + 0.6*(0.5+0.5*Math.sin(tick*2+p.phase))) : p.size
        ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, Math.PI*2)
        ctx.fillStyle = colors[p.type]; ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx*dx+dy*dy)
          if (d < 80) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = '#00d4ff'; ctx.globalAlpha = 0.08*(1-d/80); ctx.lineWidth = 0.5; ctx.stroke(); ctx.globalAlpha = 1
          }
        }
      }
      animId = requestAnimationFrame(animate)
    }
    animate()
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(7,10,18,0.6) 70%, #070a12 100%)' }} />
      {/* Noise texture */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, opacity: 0.03, backgroundImage: NOISE_BG, backgroundSize: '256px' }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '80px 24px 40px', maxWidth: 960, margin: '0 auto' }}>

        {/* Badge — .hero-badge class adds CSS ::after shimmer */}
        <div className="hero-badge hero-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--cyan-border)', background: 'var(--cyan-dim)', borderRadius: 20, padding: '6px 16px', color: 'var(--t2)', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c3)', display: 'inline-block', flexShrink: 0, animation: 'pulse-dot 1.5s infinite' }} />
          LIVE &nbsp;AI-POWERED PPE DETECTION &nbsp;— &nbsp;SSE STREAMING
        </div>

        {/* H1 — exact source structure: inline spans separated by <br> */}
        <h1 className="hero-h1" style={{ marginBottom: 28 }}>
          <span style={{ color: 'var(--t1)' }}>Zero Blind Spots.</span><br />
          <span className="text-gradient-hero">Complete Safety<br />Intelligence.</span><br />
          <span style={{ color: 'var(--t1)' }}>For Every Site.</span>
        </h1>

        {/* Sub */}
        <p className="hero-subheadline" style={{ color: 'var(--t2)', maxWidth: 580, margin: '0 auto 40px' }}>
          From video upload to annotated output — detect missing PPE, track every worker, and prove compliance with AI precision.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
          <a href="#cta-section" className="hero-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', borderRadius: 8, background: 'var(--cyan)', color: '#000', textDecoration: 'none', transition: 'box-shadow 0.2s, transform 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--c1-glow)'; e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)' }}>
            Start Free Analysis <span>→</span>
          </a>
          <a href="#how-it-works" className="hero-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', borderRadius: 8, background: 'transparent', color: 'var(--t1)', border: '1px solid var(--border-bright)', textDecoration: 'none', transition: 'border-color 0.2s, color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c2-bright)'; e.currentTarget.style.color = 'var(--c2-bright)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--t1)' }}>
            Watch Demo ▶
          </a>
        </div>

        {/* Social proof */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 48 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, hsl(${i*60},80%,50%), hsl(${i*60+40},80%,60%))`, border: '2px solid var(--bg-base)' }} />
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--t3)' }}>Trusted by 340+ industrial facilities</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--t3)' }}>
            <span style={{ color: 'var(--c4)' }}>★★★★★</span>&nbsp; 4.9/5 from 200+ safety teams
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'bob 2s ease-in-out infinite' }}>
          <div style={{ width: 20, height: 20, borderRight: '2px solid var(--t4)', borderBottom: '2px solid var(--t4)', transform: 'rotate(45deg)' }} />
          <div className="hero-label" style={{ color: 'var(--t4)' }}>SCROLL TO EXPLORE</div>
        </div>
      </div>
    </section>
  )
}
