'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, UserCheck, Shield, Users,
  FileBarChart, Settings2, ShieldAlert,
  ChevronLeft, LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'

type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPERVISOR' | 'VIEWER'

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/attendance', label: 'Attendance',   icon: UserCheck },
  { href: '/ppe',        label: 'PPE Analysis', icon: Shield },
  { href: '/workers',    label: 'Workers',      icon: Users },
  { href: '/reports',    label: 'Reports',      icon: FileBarChart },
  { href: '/settings',   label: 'Settings',     icon: Settings2 },
] as const

const ROLE_META: Record<UserRole, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'SUPER ADMIN', color: 'var(--violet)' },
  ADMIN:       { label: 'ADMIN',       color: 'var(--cyan)' },
  SUPERVISOR:  { label: 'SUPERVISOR',  color: 'var(--amber)' },
  VIEWER:      { label: 'VIEWER',      color: 'var(--text-muted)' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface SidebarProps {
  /** When true, always show full width (used inside MobileSidebar) */
  forceExpanded?: boolean
}

export function Sidebar({ forceExpanded = false }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUiStore()
  const pathname = usePathname()

  const collapsed = !forceExpanded && !sidebarOpen
  const roleMeta = user ? (ROLE_META[user.role as UserRole] ?? ROLE_META.VIEWER) : null

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  function navStyle(active: boolean): React.CSSProperties {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: collapsed ? 0 : 10,
      borderRadius: 6,
      padding: collapsed ? '10px 0' : '9px 10px',
      justifyContent: collapsed ? 'center' : 'flex-start',
      borderLeft: active ? '3px solid var(--cyan)' : '3px solid transparent',
      background: active ? 'var(--cyan-dim)' : 'transparent',
      color: active ? 'var(--cyan)' : 'var(--text-secondary)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      letterSpacing: '0.02em',
      textDecoration: 'none',
      transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
      cursor: 'pointer',
      width: '100%',
    }
  }

  function adminNavStyle(active: boolean): React.CSSProperties {
    return {
      ...navStyle(active),
      borderLeft: active ? '3px solid var(--violet)' : '3px solid transparent',
      background: active ? 'var(--violet-dim)' : 'transparent',
      color: active ? 'var(--violet)' : 'var(--text-secondary)',
    }
  }

  return (
    <nav
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Right-edge gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 1,
          height: '100%',
          background: 'linear-gradient(to bottom, transparent, var(--border), transparent)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ── Logo / Brand ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? '18px 0' : '18px 16px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid var(--border)',
          minHeight: 64,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: 'var(--cyan-dim)',
            border: '1px solid rgba(0,212,255,0.25)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Shield size={17} style={{ color: 'var(--cyan)' }} />
        </div>
        {!collapsed && (
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.12em',
                color: 'var(--text-primary)',
                lineHeight: 1.2,
              }}
            >
              PPE ANALYTICS
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-muted)',
                marginTop: 1,
              }}
            >
              v1.0.0
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: collapsed ? '12px 4px' : '12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={navStyle(active)}
              onMouseEnter={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.color = 'var(--text-primary)'
                  el.style.background = 'var(--bg-elevated)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.color = 'var(--text-secondary)'
                  el.style.background = 'transparent'
                }
              }}
            >
              <Icon size={15} style={{ flexShrink: 0, color: active ? 'var(--cyan)' : 'inherit' }} />
              {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>}
            </Link>
          )
        })}

        {/* Admin-only link */}
        {user?.role === 'SUPER_ADMIN' && (() => {
          const active = pathname.startsWith('/admin')
          return (
            <Link
              key="/admin/users"
              href="/admin/users"
              title={collapsed ? 'Admin' : undefined}
              style={adminNavStyle(active)}
              onMouseEnter={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.color = 'var(--violet)'
                  el.style.background = 'var(--violet-dim)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.color = 'var(--text-secondary)'
                  el.style.background = 'transparent'
                }
              }}
            >
              <ShieldAlert size={15} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Admin</span>}
            </Link>
          )
        })()}
      </div>

      {/* ── Bottom: Profile + Collapse ── */}
      <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        {/* Profile card */}
        {!collapsed && user && (
          <div style={{ padding: '10px 10px 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'var(--cyan-dim)',
                  border: '1px solid rgba(0,212,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: 11,
                  color: 'var(--cyan)',
                  overflow: 'hidden',
                }}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              {/* Name + role */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name}
                </div>
                {roleMeta && (
                  <div
                    style={{
                      fontSize: 9,
                      fontFamily: 'var(--font-mono)',
                      color: roleMeta.color,
                      marginTop: 1,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {roleMeta.label}
                  </div>
                )}
              </div>
              {/* Logout */}
              <button
                onClick={() => logout()}
                title="Logout"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  borderRadius: 4,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Collapsed: show logout icon only */}
        {collapsed && user && (
          <div style={{ padding: '8px 4px', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => logout()}
              title="Logout"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px',
                borderRadius: 6,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 0',
            background: 'transparent',
            border: 'none',
            borderTop: '1px solid var(--border)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
        >
          <ChevronLeft
            size={15}
            style={{
              transform: collapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s ease',
            }}
          />
        </button>
      </div>
    </nav>
  )
}
