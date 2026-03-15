'use client'
import Link from 'next/link'

const productLinks = ['Features', 'Pricing', 'Demo', 'Changelog', 'Status']
const companyLinks = ['About', 'Blog', 'Careers', 'Press', 'Contact']
const legalLinks = ['Privacy', 'Terms', 'Security', 'GDPR', 'Cookie Policy']

export default function HomeFooter() {
  const linkStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: 'var(--t3)',
    textDecoration: 'none',
    transition: 'color 0.2s',
    cursor: 'pointer',
  }

  return (
    <footer style={{ background: 'var(--bg-void)', borderTop: '1px solid var(--border-dim)', padding: '60px 48px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                <path d="M18 2L4 8v10c0 8.4 6 16.2 14 18 8-1.8 14-9.6 14-18V8L18 2z" stroke="url(#shieldGradFtr)" strokeWidth="1.5" fill="none" />
                <circle cx="18" cy="17" r="2" fill="#00d4ff" />
                <defs>
                  <linearGradient id="shieldGradFtr" x1="4" y1="2" x2="32" y2="34">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--t1)', letterSpacing: '0.05em' }}>PPE ANALYTICS</span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--t3)', lineHeight: 1.7, maxWidth: 280, marginBottom: 20 }}>
              AI-powered worker safety and attendance intelligence for industrial enterprises. Built for the world's most demanding worksites.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['in', 'gh', 'tw'].map((s) => (
                <a key={s} href="#" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--t3)', textDecoration: 'none', transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--t3)' }}
                >{s}</a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--t2)', marginBottom: 20, textTransform: 'uppercase' as const }}>Product</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {productLinks.map((l) => (
                <li key={l}><a href="#" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--t1)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--t3)')}>{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--t2)', marginBottom: 20, textTransform: 'uppercase' as const }}>Company</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {companyLinks.map((l) => (
                <li key={l}><a href="#" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--t1)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--t3)')}>{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--t2)', marginBottom: 20, textTransform: 'uppercase' as const }}>Legal</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {legalLinks.map((l) => (
                <li key={l}><a href="#" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--t1)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--t3)')}>{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid var(--border-dim)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--t4)' }}>© 2025 PPE Analytics. All rights reserved.</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--t4)' }}>Built for the world's safest workplaces.</span>
        </div>
      </div>
      <style>{`@media(max-width:900px){.footer-grid{grid-template-columns:1fr 1fr!important;}}@media(max-width:480px){.footer-grid{grid-template-columns:1fr!important;}}`}</style>
    </footer>
  )
}
