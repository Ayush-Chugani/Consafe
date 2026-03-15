'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function HomeNav() {
  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const link = (href: string, label: string) => (
    <a href={href} style={{
      fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--t2)', textDecoration: 'none',
      position: 'relative', transition: 'color 0.2s',
    }}
    onMouseEnter={e => (e.currentTarget.style.color = 'var(--cyan)')}
    onMouseLeave={e => (e.currentTarget.style.color = 'var(--t2)')}
    >{label}</a>
  )

  return (
    <nav ref={navRef} style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: '0 48px', height: 72,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32,
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      backgroundColor: scrolled ? 'rgba(7,10,18,0.85)' : 'transparent',
      borderBottom: scrolled ? '1px solid rgba(28,34,56,0.8)' : 'none',
      transition: 'background-color 0.4s, backdrop-filter 0.4s, border-bottom 0.4s',
    }}>
      {/* Logo */}
      <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
          <path d="M18 2L4 8v10c0 8.4 6 16.2 14 18 8-1.8 14-9.6 14-18V8L18 2z" fill="url(#sg)" opacity="0.15"/>
          <path d="M18 2L4 8v10c0 8.4 6 16.2 14 18 8-1.8 14-9.6 14-18V8L18 2z" stroke="url(#sg)" strokeWidth="1.5"/>
          <ellipse cx="18" cy="17" rx="5" ry="3.5" stroke="#00d4ff" strokeWidth="1.2"/>
          <circle cx="18" cy="17" r="2" fill="#00d4ff"/>
          <circle cx="18" cy="17" r="1" fill="#000"/>
          <defs>
            <linearGradient id="sg" x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00d4ff"/>
              <stop offset="50%" stopColor="#a855f7"/>
              <stop offset="100%" stopColor="#00ff88"/>
            </linearGradient>
          </defs>
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--t1)', letterSpacing: '0.05em' }}>PPE ANALYTICS</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--t3)', letterSpacing: '0.2em' }}>PLATFORM</div>
        </div>
      </a>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links-desktop">
        {link('#features', 'Features')}
        {link('#how-it-works', 'How It Works')}
        {link('#analytics', 'Analytics')}
        {link('#security', 'Security')}
        {link('#pricing', 'Pricing')}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link href="/dashboard" style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--cyan)',
          border: '1px solid rgba(0,212,255,0.30)', padding: '10px 20px', borderRadius: 6,
          textDecoration: 'none', transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
          letterSpacing: '0.05em',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--cyan)'; e.currentTarget.style.color = '#000'; e.currentTarget.style.boxShadow = 'var(--c1-glow)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--cyan)'; e.currentTarget.style.boxShadow = 'none' }}
        >Open Dashboard</Link>
        <a href="#cta-section" style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--cyan)',
          border: '1px solid rgba(0,212,255,0.30)', padding: '10px 24px', borderRadius: 6,
          textDecoration: 'none', transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
          letterSpacing: '0.05em',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--cyan)'; e.currentTarget.style.color = '#000'; e.currentTarget.style.boxShadow = 'var(--c1-glow)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--cyan)'; e.currentTarget.style.boxShadow = 'none' }}
        >Request Demo</a>
      </div>

      <style>{`
        @media (max-width: 768px) { .nav-links-desktop { display: none !important; } }
      `}</style>
    </nav>
  )
}
