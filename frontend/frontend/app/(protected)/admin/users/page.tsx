'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Plus, Shield, Trash2, KeyRound, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { adminService } from '@/api/services/adminService'
import { Card } from '@/components/custom/Card'
import { Badge } from '@/components/custom/Badge'
import { Button } from '@/components/custom/Button'
import { useAuthStore } from '@/store/authStore'
import { formatDateTime } from '@/lib/utils'
import type { UserRole } from '@/api/types'

type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT'

const ROLE_CONFIG: Record<UserRole, { label: string; variant: 'violet' | 'cyan' | 'amber' | 'gray' }> = {
  SUPER_ADMIN: { label: 'Super Admin', variant: 'violet' },
  ADMIN:       { label: 'Admin',       variant: 'cyan' },
  SUPERVISOR:  { label: 'Supervisor',  variant: 'amber' },
  VIEWER:      { label: 'Viewer',      variant: 'gray' },
}

const ACTION_VARIANT: Record<AuditActionType, 'cyan' | 'amber' | 'red' | 'green' | 'gray'> = {
  CREATE: 'green',
  UPDATE: 'cyan',
  DELETE: 'red',
  LOGIN: 'amber',
  EXPORT: 'gray',
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users')
  const [auditPage, setAuditPage] = useState(1)
  const [searchAudit, setSearchAudit] = useState('')
  const auditLimit = 25

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  // Role guard: only SUPER_ADMIN can access this page
  useEffect(() => {
    if (user && !isSuperAdmin) {
      router.push('/dashboard')
    }
  }, [user, isSuperAdmin, router])

  // All hooks must be called unconditionally before any early return
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.listUsers(),
    enabled: isSuperAdmin,
  })

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['audit-log', auditPage, searchAudit],
    queryFn: () => adminService.auditLog({ page: auditPage, limit: auditLimit }),
    enabled: isSuperAdmin && activeTab === 'audit',
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  // Conditional render guard after all hooks
  if (!isSuperAdmin) return null

  const auditLogs = auditData?.data ?? []
  const auditTotal = auditData?.total ?? 0
  const auditTotalPages = Math.ceil(auditTotal / auditLimit)

  return (
    <div>
      {/* Page header */}
      <div data-reveal="" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)' }}>
              Admin Panel
            </h2>
            <Badge variant="violet" dot>SUPER ADMIN</Badge>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Manage admin users and view system audit trail
          </p>
        </div>
        <Button variant="primary" size="md" icon={<Plus size={13} />}>
          Add Admin User
        </Button>
      </div>

      {/* Tabs */}
      <div data-reveal="" style={{ display: 'flex', gap: 2, marginBottom: 20, background: 'var(--bg-elevated)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {[
          { id: 'users' as const, label: 'Users', icon: <Users size={13} /> },
          { id: 'audit' as const, label: 'Audit Log', icon: <Shield size={13} /> },
        ].map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 20px',
              borderRadius: 7, border: 'none', cursor: 'pointer',
              background: activeTab === id ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {activeTab === 'users' && (
        <div data-reveal="">
          {usersLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 100, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, animation: 'fadeIn 1s ease infinite alternate' }} />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Users size={32} style={{ color: 'var(--text-dim)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>No admin users</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {users.map((u) => {
                const roleCfg = ROLE_CONFIG[u.role]
                return (
                  <div
                    key={u.id}
                    style={{
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      borderRadius: 12, padding: 20,
                      transition: 'border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-bright)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: u.role === 'SUPER_ADMIN' ? 'var(--violet-dim)' : 'var(--cyan-dim)',
                          border: `1.5px solid ${u.role === 'SUPER_ADMIN' ? 'rgba(167,139,250,0.3)' : 'var(--cyan-border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                          color: u.role === 'SUPER_ADMIN' ? 'var(--violet)' : 'var(--cyan)',
                          overflow: 'hidden',
                        }}>
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : getInitials(u.name)}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            {u.name}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                            {u.email}
                          </p>
                        </div>
                      </div>
                      <Badge variant={roleCfg.variant}>{roleCfg.label}</Badge>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <Badge variant={u.isActive ? 'green' : 'red'} dot>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                        {u.lastLoginAt && (
                          <p style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                            Last login: {formatDateTime(u.lastLoginAt)}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          title="Reset password"
                          onClick={() => adminService.resetPassword(u.id, crypto.randomUUID())}
                          style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                            color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'color 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--amber)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
                        >
                          <KeyRound size={12} />
                        </button>
                        <button
                          title="Delete user"
                          onClick={() => {
                            if (confirm(`Delete user ${u.name}?`)) {
                              deleteUserMutation.mutate(u.id)
                            }
                          }}
                          style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                            color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'color 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Audit log tab */}
      {activeTab === 'audit' && (
        <div data-reveal="">
          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
            <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Filter audit log..."
              value={searchAudit}
              onChange={(e) => { setSearchAudit(e.target.value); setAuditPage(1) }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none', width: '100%' }}
            />
          </div>

          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Admin', 'Action', 'Resource', 'IP Address', 'Timestamp'].map((h) => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}><td colSpan={5} style={{ padding: '12px', borderBottom: '1px solid var(--border-dim)' }}>
                        <div style={{ height: 12, background: 'var(--bg-elevated)', borderRadius: 4, width: '70%' }} />
                      </td></tr>
                    ))
                  ) : auditLogs.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      No audit log entries
                    </td></tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr
                        key={log.id}
                        style={{ borderBottom: '1px solid var(--border-dim)', transition: 'background 0.1s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <td style={{ padding: '10px 12px' }}>
                          <p style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            {log.admin?.name ?? 'System'}
                          </p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                            {log.admin?.email ?? '—'}
                          </p>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <Badge variant={ACTION_VARIANT[log.action as AuditActionType] ?? 'gray'}>
                            {log.action}
                          </Badge>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {log.resourceType}
                          </p>
                          {log.resourceId && (
                            <p style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                              {log.resourceId.slice(0, 8)}...
                            </p>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {log.ipAddress}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {formatDateTime(log.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {auditTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-dim)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {auditTotal} entries · Page {auditPage} of {auditTotalPages}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button variant="secondary" size="sm" disabled={auditPage === 1} onClick={() => setAuditPage(p => p - 1)}
                    icon={<ChevronLeft size={12} />}>Prev</Button>
                  <Button variant="secondary" size="sm" disabled={auditPage >= auditTotalPages} onClick={() => setAuditPage(p => p + 1)}
                    icon={<ChevronRight size={12} />} iconPosition="right">Next</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
