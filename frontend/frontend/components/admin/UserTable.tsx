'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Key, Trash2, Power } from 'lucide-react'
import { adminService } from '@/api/services/adminService'
import type { AdminUser, UserRole } from '@/api/types'

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string }> = {
  SUPER_ADMIN: { label: 'SUPER ADMIN', color: 'var(--violet)', bg: 'var(--violet-dim)' },
  ADMIN:       { label: 'ADMIN',       color: 'var(--cyan)',   bg: 'var(--cyan-dim)'   },
  SUPERVISOR:  { label: 'SUPERVISOR',  color: 'var(--amber)',  bg: 'var(--amber-dim)'  },
  VIEWER:      { label: 'VIEWER',      color: 'var(--text-secondary)', bg: 'rgba(123,133,158,0.1)' },
}

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

interface Props {
  onEdit: (user: AdminUser) => void
  onDelete: (user: AdminUser) => void
}

export default function UserTable({ onEdit, onDelete }: Props) {
  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.listUsers(),
  })

  const toggleActive = useMutation({
    mutationFn: (user: AdminUser) =>
      adminService.updateUser(user.id, { isActive: !user.isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const resetPassword = useMutation({
    mutationFn: (userId: string) =>
      adminService.resetPassword(userId, Math.random().toString(36).slice(-10)),
    onSuccess: () => alert('Password reset email sent.'),
  })

  const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    borderBottom: '1px solid var(--border)',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    background: 'var(--bg-elevated)',
  }

  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>USER</th>
            <th style={thStyle}>EMAIL</th>
            <th style={thStyle}>ROLE</th>
            <th style={thStyle}>LAST LOGIN</th>
            <th style={thStyle}>STATUS</th>
            <th style={thStyle}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <td key={j} style={{ padding: '14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ height: 12, background: 'var(--border)', borderRadius: 3 }} />
                  </td>
                ))}
              </tr>
            ))
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '40px', textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
                NO ADMIN USERS FOUND
              </td>
            </tr>
          ) : (
            users.map((user, i) => {
              const roleCfg = ROLE_CONFIG[user.role]
              return (
                <tr
                  key={user.id}
                  style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}
                  onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay, #1a2035)' }}
                  onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}
                >
                  {/* User */}
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--bg-overlay, #1a2035)',
                            border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700,
                            color: roleCfg.color,
                          }}
                        >
                          {initials(user.name)}
                        </div>
                      )}
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                        {user.name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--text-secondary)' }}>
                    {user.email}
                  </td>

                  {/* Role */}
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4,
                      background: roleCfg.bg, border: `1px solid ${roleCfg.color}33`,
                      fontFamily: "'DM Mono', monospace", fontSize: 9,
                      color: roleCfg.color, letterSpacing: '0.06em',
                    }}>
                      {roleCfg.label}
                    </span>
                  </td>

                  {/* Last login */}
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', fontFamily: "'Roboto Mono', monospace", fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: user.isActive ? 'var(--green)' : 'var(--red)',
                          boxShadow: user.isActive ? '0 0 6px var(--green-glow)' : 'none',
                        }}
                      />
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: user.isActive ? 'var(--green)' : 'var(--red)' }}>
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        title="Edit"
                        onClick={() => onEdit(user)}
                        style={{
                          padding: '5px 8px', background: 'transparent',
                          border: '1px solid var(--border)', borderRadius: 5,
                          color: 'var(--cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                          transition: 'border-color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={(e) => { ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--cyan)'; ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--cyan-dim)' }}
                        onMouseLeave={(e) => { ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        title="Reset Password"
                        onClick={() => resetPassword.mutate(user.id)}
                        style={{
                          padding: '5px 8px', background: 'transparent',
                          border: '1px solid var(--border)', borderRadius: 5,
                          color: 'var(--amber)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        }}
                      >
                        <Key size={12} />
                      </button>
                      <button
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => toggleActive.mutate(user)}
                        style={{
                          padding: '5px 8px', background: 'transparent',
                          border: '1px solid var(--border)', borderRadius: 5,
                          color: user.isActive ? 'var(--red)' : 'var(--green)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        }}
                      >
                        <Power size={12} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => onDelete(user)}
                        style={{
                          padding: '5px 8px', background: 'transparent',
                          border: '1px solid var(--border)', borderRadius: 5,
                          color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
