'use client'

export default function AnalyticsDashboard() {
  const kpis = [
    { num: '47', label: 'Workers On-Site', trend: '↑ 3 vs yesterday', trendColor: 'var(--t2)' },
    { num: '91.3%', label: 'Compliance Rate', trend: '↑ 2.1% this week', trendColor: 'var(--c3)' },
    { num: '4', label: 'Active Violations', trend: '↑ 1 new alert', trendColor: 'var(--c5)', gradient: true },
    { num: '18', label: 'Jobs Today', trend: '↑ 5 completed', trendColor: 'var(--t2)' },
  ]

  const ppeBars = [
    { name: 'Helmet', pct: 98 },
    { name: 'Vest', pct: 94 },
    { name: 'Gloves', pct: 87 },
    { name: 'Boots', pct: 79 },
  ]

  const workers = [
    { id: 'W-002', badge: 'NO HELMET', badgeColor: 'var(--c4)', badgeBg: 'rgba(245,158,11,0.12)', avatarBg: 'var(--c4)', frames: '623 frames · 41 events' },
    { id: 'W-005', badge: 'NO GLOVES', badgeColor: 'var(--c5)', badgeBg: 'rgba(255,51,102,0.12)', avatarBg: 'var(--cyan)', frames: '440 frames · 28 events' },
    { id: 'W-001', badge: 'COMPLIANT', badgeColor: 'var(--c3)', badgeBg: 'rgba(0,255,136,0.12)', avatarBg: 'var(--c3)', frames: '2400 frames · 0 events' },
  ]

  return (
    <section style={{ padding: '100px 48px', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Intro */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-label">ANALYTICS</div>
          <h2 className="section-h2" style={{ marginBottom: 16 }}>
            Command-Level <span className="text-gradient-hero">Visibility.</span>
          </h2>
          <p className="section-body" style={{ maxWidth: 560, margin: '0 auto' }}>Every metric that matters. Every worker that matters. Live, historical, and exportable — from a single command center.</p>
        </div>

        {/* Browser frame */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
          {/* Browser bar */}
          <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28ca41' }} />
            <div style={{ flex: 1, background: 'var(--bg-overlay)', borderRadius: 6, padding: '5px 14px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--t3)', maxWidth: 320, margin: '0 auto' }}>app.ppeanalytics.io/dashboard</div>
          </div>

          {/* Dashboard content */}
          <div style={{ padding: 24 }}>
            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }} className="analytics-kpi-grid">
              {kpis.map((k) => (
                <div key={k.label} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
                  <div style={k.gradient ? { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, background: 'var(--grad-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--t1)' }}>{k.num}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--t3)', letterSpacing: '0.08em', margin: '4px 0' }}>{k.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: k.trendColor }}>{k.trend}</div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }} className="analytics-charts-grid">
              {/* Attendance trend */}
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--t3)', letterSpacing: '0.08em', marginBottom: 12 }}>ATTENDANCE TREND — 7 DAYS</div>
                <svg viewBox="0 0 300 60" preserveAspectRatio="none" style={{ width: '100%', height: 60 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,40 L42,30 L85,35 L127,20 L170,15 L212,25 L255,10 L300,8 L300,60 L0,60 Z" fill="url(#areaGrad)" />
                  <path d="M0,40 L42,30 L85,35 L127,20 L170,15 L212,25 L255,10 L300,8" fill="none" stroke="#00d4ff" strokeWidth="1.5" />
                </svg>
              </div>

              {/* PPE compliance bars */}
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--t3)', letterSpacing: '0.08em', marginBottom: 12 }}>PPE COMPLIANCE BY CATEGORY</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ppeBars.map((b) => (
                    <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--t2)', width: 44, flexShrink: 0 }}>{b.name}</span>
                      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2 }}>
                        <div style={{ width: `${b.pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--cyan), var(--c3))', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--t2)', width: 30, textAlign: 'right' as const }}>{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Worker table */}
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              {workers.map((w, i) => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: i < workers.length - 1 ? '1px solid var(--border-dim)' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: w.avatarBg, opacity: 0.7, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--t1)', width: 48 }}>{w.id}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: w.badgeColor, background: w.badgeBg, border: `1px solid ${w.badgeColor}`, borderRadius: 4, padding: '2px 8px', letterSpacing: '0.06em' }}>{w.badge}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--t3)', marginLeft: 'auto' }}>{w.frames}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:768px){
          .analytics-kpi-grid{grid-template-columns:repeat(2,1fr)!important;}
          .analytics-charts-grid{grid-template-columns:1fr!important;}
        }
      `}</style>
    </section>
  )
}
