'use client'
import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  Users, ShieldCheck, AlertTriangle, Video,
  TrendingUp, TrendingDown, Activity,
} from 'lucide-react'
import { dashboardService } from '@/api/services/dashboardService'
import { Card } from '@/components/custom/Card'
import { Badge } from '@/components/custom/Badge'
import { useCountUp } from '@/hooks/useCountUp'
import { formatDateTime, complianceColor } from '@/lib/utils'

// ── Custom tooltip for charts ────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ color: string; name: string; value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-overlay)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
    }}>
      {label && (
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

// ── KPI Card ─────────────────────────────────────────────────
interface KpiCardProps {
  label: string
  value: number
  suffix?: string
  trend?: number
  trendInverted?: boolean
  icon: ReactNode
  color: string
  dimColor: string
  loading?: boolean
}

function KpiCard({ label, value, suffix, trend, trendInverted, icon, color, dimColor, loading }: KpiCardProps) {
  const displayed = useCountUp(value, 1200)

  const trendPositive = trend !== undefined
    ? (trendInverted ? trend <= 0 : trend >= 0)
    : null
  const TrendIcon = trend !== undefined && trend >= 0 ? TrendingUp : TrendingDown

  return (
    <div
      data-reveal=""
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top-right glow orb */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: dimColor,
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            {label}
          </p>
          <p style={{
            fontSize: 32,
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {loading ? '—' : displayed}
            {suffix && !loading && (
              <span style={{ fontSize: 14, color: 'var(--text-secondary)', marginLeft: 2 }}>
                {suffix}
              </span>
            )}
          </p>
        </div>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: dimColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {trend !== undefined && !loading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 12,
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: trendPositive ? 'var(--green)' : 'var(--red)',
        }}>
          <TrendIcon size={12} />
          <span>{Math.abs(trend)}% vs last week</span>
        </div>
      )}
    </div>
  )
}

// ── Activity item ─────────────────────────────────────────────
function ActivityItem({ item }: { item: {
  id: string; timestamp: string; eventType: string; description: string
  workerName: string | null; evidenceUrl: string | null
}}) {
  const colorMap: Record<string, string> = {
    FACE_DETECTED: 'var(--cyan)',
    PPE_VIOLATION: 'var(--red)',
    JOB_COMPLETED: 'var(--green)',
    WORKER_ABSENT: 'var(--amber)',
    WORKER_LATE: 'var(--orange)',
    PPE_JOB_STARTED: 'var(--violet)',
  }
  const color = colorMap[item.eventType] ?? 'var(--text-muted)'

  return (
    <div style={{
      display: 'flex',
      gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid var(--border-dim)',
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        marginTop: 5,
        flexShrink: 0,
        boxShadow: `0 0 6px ${color}`,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 12,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.4,
        }}>
          {item.description}
          {item.workerName && (
            <span style={{ color: 'var(--cyan)', marginLeft: 4 }}>
              {item.workerName}
            </span>
          )}
        </p>
        <p style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          marginTop: 2,
        }}>
          {formatDateTime(item.timestamp)}
        </p>
      </div>
    </div>
  )
}

// ── PPE Category bar ──────────────────────────────────────────
function PpeCategoryRow({ category, compliance }: { category: string; compliance: number }) {
  const color = complianceColor(compliance)

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          textTransform: 'capitalize',
        }}>
          {category.replace(/_/g, ' ')}
        </span>
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {compliance.toFixed(1)}%
        </span>
      </div>
      <div style={{
        height: 4,
        background: 'var(--bg-elevated)',
        borderRadius: 999,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${compliance}%`,
          background: color,
          borderRadius: 999,
          transition: 'width 0.8s ease',
          boxShadow: `0 0 8px ${color}`,
        }} />
      </div>
    </div>
  )
}

// ── Main Dashboard Page ───────────────────────────────────────
export default function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => dashboardService.kpis(),
    refetchInterval: 30_000,
  })

  const { data: attendanceTrend = [] } = useQuery({
    queryKey: ['dashboard-attendance-trend'],
    queryFn: () => dashboardService.attendanceTrend(7),
  })

  const { data: ppeByCategory = [] } = useQuery({
    queryKey: ['dashboard-ppe-by-category'],
    queryFn: () => dashboardService.ppeByCategory(),
  })

  const { data: safetyDist } = useQuery({
    queryKey: ['dashboard-safety-distribution'],
    queryFn: () => dashboardService.safetyDistribution(),
  })

  const { data: activityFeed = [] } = useQuery({
    queryKey: ['dashboard-activity-feed'],
    queryFn: () => dashboardService.activityFeed(15),
    refetchInterval: 15_000,
  })

  const safetyPieData = safetyDist
    ? [
        { name: 'Excellent', value: safetyDist.excellent, color: 'var(--green)' },
        { name: 'Good', value: safetyDist.good, color: 'var(--cyan)' },
        { name: 'At Risk', value: safetyDist.atRisk, color: 'var(--amber)' },
        { name: 'Critical', value: safetyDist.critical, color: 'var(--red)' },
      ]
    : []

  return (
    <div>
      {/* Page header */}
      <div data-reveal="" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 24,
            color: 'var(--text-primary)',
          }}>
            Operations Overview
          </h2>
          <Badge variant="cyan" dot pulse>LIVE</Badge>
        </div>
        <p style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
        }}>
          Real-time safety compliance and attendance metrics
        </p>
      </div>

      {/* KPI grid */}
      <div
        data-reveal=""
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <KpiCard
          label="On Site Now"
          value={kpis?.onSite ?? 0}
          suffix={kpis ? `/ ${kpis.onSiteTotal}` : undefined}
          trend={kpis?.onSiteTrend}
          icon={<Users size={18} />}
          color="var(--cyan)"
          dimColor="var(--cyan-dim)"
          loading={kpisLoading}
        />
        <KpiCard
          label="Compliance Rate"
          value={kpis?.complianceRate ?? 0}
          suffix="%"
          trend={kpis?.complianceTrend}
          icon={<ShieldCheck size={18} />}
          color="var(--green)"
          dimColor="var(--green-dim)"
          loading={kpisLoading}
        />
        <KpiCard
          label="Active Violations"
          value={kpis?.activeViolations ?? 0}
          trend={kpis?.violationsTrend}
          trendInverted
          icon={<AlertTriangle size={18} />}
          color="var(--red)"
          dimColor="var(--red-dim)"
          loading={kpisLoading}
        />
        <KpiCard
          label="Jobs This Week"
          value={kpis?.jobsThisWeek ?? 0}
          trend={kpis?.jobsTrend}
          icon={<Video size={18} />}
          color="var(--violet)"
          dimColor="var(--violet-dim)"
          loading={kpisLoading}
        />
      </div>

      {/* Charts row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 16,
        marginBottom: 16,
      }}>
        {/* Attendance trend chart */}
        <Card
          title="Attendance Trend"
          subtitle="Last 7 days"
          data-reveal=""
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={attendanceTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--cyan)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--red)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--red)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-dim)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                tickFormatter={(v: string) => v.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="present" name="Present" stroke="var(--cyan)" fill="url(#presentGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="absent" name="Absent" stroke="var(--red)" fill="url(#absentGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="late" name="Late" stroke="var(--amber)" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            {[
              { color: 'var(--cyan)', label: 'Present' },
              { color: 'var(--red)', label: 'Absent' },
              { color: 'var(--amber)', label: 'Late' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 2, background: color, borderRadius: 1 }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Safety distribution pie */}
        <Card title="Safety Distribution" data-reveal="">
          {safetyPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={safetyPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {safetyPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-overlay)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {safetyPieData.map(({ name, value, color }) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {name}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                No data available
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: 16,
      }}>
        {/* PPE compliance by category */}
        <Card title="PPE Compliance by Category" subtitle="Current period" data-reveal="">
          {ppeByCategory.length > 0 ? (
            ppeByCategory.map((item) => (
              <PpeCategoryRow key={item.category} category={item.category} compliance={item.compliance} />
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '20px 0', textAlign: 'center' }}>
              No compliance data
            </p>
          )}
        </Card>

        {/* Live activity feed */}
        <Card
          title="Activity Feed"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulseDot 2s ease infinite' }} />
              <span style={{ fontSize: 10, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>LIVE</span>
            </div>
          }
          data-reveal=""
        >
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {activityFeed.length > 0 ? (
              activityFeed.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))
            ) : (
              <div style={{
                padding: '32px 0',
                textAlign: 'center',
              }}>
                <Activity size={24} style={{ color: 'var(--text-dim)', margin: '0 auto 8px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  No recent activity
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
