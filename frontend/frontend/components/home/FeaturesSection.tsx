'use client'
import { useRef, useState } from 'react'

function FeatureCard({ icon, iconBg, label, labelColor, title, body, anim }: {
  icon: React.ReactNode; iconBg: string; label: string; labelColor: string
  title: string; body: string; anim: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32,
        position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s, box-shadow 0.3s',
        borderColor: hovered ? 'var(--border-bright)' : 'var(--border)',
        boxShadow: hovered ? '0 0 40px rgba(0,212,255,0.05)' : 'none',
      }}>
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--grad-cyan-violet)', transformOrigin: 'left', transform: hovered ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 0.4s ease' }} />
      {/* Icon */}
      <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, transition: 'transform 0.3s', transform: hovered ? 'rotate(10deg)' : 'none' }}>
        {icon}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: labelColor, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>{title}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--t2)', lineHeight: 1.7, marginBottom: 16 }}>{body}</div>
      <div style={{ marginTop: 'auto' }}>{anim}</div>
    </div>
  )
}

const Svg = ({ d, extra }: { d: string; extra?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" dangerouslySetInnerHTML={{ __html: d + (extra || '') }} />
)

export default function FeaturesSection() {
  return (
    <section id="features" style={{ padding: '100px 48px', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 56 }}>
          <div className="section-label">PLATFORM CAPABILITIES</div>
          <h2 className="section-h2">
            Everything a Safety Team<br /><span className="text-gradient-hero">Actually Needs.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="features-grid">
          <FeatureCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="1" fill="white"/></svg>}
            iconBg="var(--grad-cyan-violet)" label="PPE DETECTION ENGINE" labelColor="var(--cyan)"
            title="Real-Time PPE Analysis"
            body="Upload any site footage and get frame-by-frame detection of 12 PPE classes — helmet, vest, gloves, boots, harness and more — with configurable confidence thresholds."
            anim={<div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--t3)' }}>CONF: <span style={{ color: 'var(--cyan)' }}>0.87</span></div>}
          />
          <FeatureCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/><polyline points="16 11 18 13 22 9"/></svg>}
            iconBg="var(--grad-violet-green)" label="FACE ATTENDANCE" labelColor="var(--c2-bright)"
            title="Face Recognition Attendance"
            body="Workers clock in automatically via face recognition. Every detection is timestamped, stored with proof frames, and linked to their safety compliance record."
            anim={<div style={{ display: 'flex', gap: 8 }}>
              {['var(--cyan)','var(--c3)','rgba(0,212,255,0.3)'].map((c, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${c}`, background: i < 2 ? `${c}20` : 'transparent' }} />
              ))}
            </div>}
          />
          <FeatureCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
            iconBg="linear-gradient(135deg,#00ff88,#00d4ff)" label="LIVE STREAMING" labelColor="var(--c3)"
            title="SSE Live Frame Preview"
            body="Watch annotated frames stream in real time as the job runs. Workers, bounding boxes, and missing PPE items update live — no polling, no page refresh."
            anim={<div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 24 }}>
              {[0.3,0.6,1,0.8,0.5,0.9,0.7].map((h, i) => (
                <div key={i} style={{ flex: 1, background: 'var(--grad-cyan-violet)', borderRadius: 2, animation: `waveBar 1s ${i*0.15}s ease-in-out infinite`, transformOrigin: 'bottom' }} />
              ))}
            </div>}
          />
          <FeatureCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg>}
            iconBg="linear-gradient(135deg,#f59e0b,#ef4444)" label="EVIDENCE VAULT" labelColor="var(--c4)"
            title="Immutable Proof Chain"
            body="Every violation is stored as an annotated JPEG with metadata — frame index, timestamp, confidence score, and worker ID. Exportable as branded PDF evidence reports."
            anim={<div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c4)', border: '1px solid rgba(245,158,11,0.30)', padding: '4px 10px', borderRadius: 4, display: 'inline-block' }}>EVIDENCE #A4F2</div>}
          />
          <FeatureCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
            iconBg="linear-gradient(135deg,#00d4ff,#00ff88)" label="ADMIN COMMAND CENTER" labelColor="var(--cyan)"
            title="Role-Based Admin Panel"
            body="Granular access control with SUPER_ADMIN, ADMIN, SUPERVISOR, and VIEWER tiers. Full audit log with IP tracking and old/new value diffs."
            anim={<div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
              {[['SUPER_ADMIN','#ff3366'],['ADMIN','#00d4ff'],['SUPERVISOR','#f59e0b'],['VIEWER','#00ff88']].map(([r, c]) => (
                <span key={r} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 8px', borderRadius: 4, background: `${c}20`, color: c, border: `1px solid ${c}50` }}>{r}</span>
              ))}
            </div>}
          />
          <FeatureCard
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
            iconBg="linear-gradient(135deg,#a855f7,#7c3aed)" label="SAFETY ANALYTICS" labelColor="var(--c2-bright)"
            title="Worker Safety Scoring"
            body="Automated daily safety scores per worker combining attendance, punctuality, and PPE compliance. Trend charts, violation histories, and executive reports."
            anim={<div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 28 }}>
              {[40,60,35,80,55,90,70].map((h, i) => (
                <div key={i} style={{ width: 8, height: `${h}%`, background: 'var(--grad-cyan-violet)', borderRadius: 2, opacity: 0.8 }} />
              ))}
            </div>}
          />
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) { .features-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px)  { .features-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
