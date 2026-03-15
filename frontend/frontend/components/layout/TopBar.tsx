'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Search, Plus, Menu, ChevronRight, Settings, User, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/attendance':  'Attendance',
  '/ppe':         'PPE Analysis',
  '/workers':     'Workers',
  '/reports':     'Reports',
  '/settings':    'Settings',
  '/admin/users': 'Admin — Users',
}

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/workers/')) return 'Worker Profile'
  if (pathname.startsWith('/ppe/')) return 'PPE Job Detail'
  if (pathname.startsWith('/admin/')) return 'Administration'
  return 'PPE Analytics'
}

function buildBreadcrumb(pathname: string): string[] {
  return pathname
    .split('/')
    .filter(Boolean)
    .map((seg) => {
      if (seg.length === 36 && seg.includes('-')) return 'Detail'
      if (seg === 'admin') return 'Admin'
      return seg.charAt(0).toUpperCase() + seg.slice(1)
    })
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

export function TopBar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { notifications, setMobileSidebar } = useUiStore()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const title = resolveTitle(pathname)
  const breadcrumb = buildBreadcrumb(pathname)
  const unreadCount = notifications.filter((n) => !n.read).length

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  const iconButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 6,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'color 0.15s ease, background 0.15s ease',
  }

  function onIconEnter(e: React.MouseEvent<HTMLButtonElement>) {
    const el = e.currentTarget
    el.style.color = 'var(--text-primary)'
    el.style.background = 'var(--bg-elevated)'
  }
  function onIconLeave(e: React.MouseEvent<HTMLButtonElement>) {
    const el = e.currentTarget
    el.style.color = 'var(--text-secondary)'
    el.style.background = 'transparent'
  }

  return (
    <header
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 16,
        gap: 12,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        zIndex: 50,
      }}
    >
      {/* Mobile hamburger */}
      <button
        className="flex lg:hidden"
        style={iconButtonStyle}
        onClick={() => setMobileSidebar(true)}
        onMouseEnter={onIconEnter}
        onMouseLeave={onIconLeave}
        title="Open menu"
      >
        <Menu size={16} />
      </button>

      {/* Title + breadcrumb */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 17,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text-muted)',
            marginTop: 1,
          }}
        >
          {breadcrumb.map((seg, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {i > 0 && <ChevronRight size={8} style={{ opacity: 0.5 }} />}
              {seg}
            </span>
          ))}
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {/* Search */}
        <button
          style={iconButtonStyle}
          onMouseEnter={onIconEnter}
          onMouseLeave={onIconLeave}
          title="Search"
        >
          <Search size={14} />
        </button>

        {/* Notifications */}
        <button
          style={{ ...iconButtonStyle, position: 'relative' }}
          onMouseEnter={onIconEnter}
          onMouseLeave={onIconLeave}
          title="Notifications"
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 3,
                right: 3,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: 'var(--cyan)',
                color: '#000',
                fontSize: 8,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Plus / Quick add */}
        <button
          style={iconButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--cyan)'
            e.currentTarget.style.background = 'var(--cyan-dim)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)'
            e.currentTarget.style.background = 'transparent'
          }}
          title="New"
        >
          <Plus size={14} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

        {/* User avatar + dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 6px',
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--cyan-dim)',
                border: '1px solid rgba(0,212,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 11,
                color: 'var(--cyan)',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                getInitials(user?.name ?? 'A')
              )}
            </div>
            <div className="hidden sm:block" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.2 }}>
                {user?.name ?? 'Admin'}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {user?.role ?? ''}
              </div>
            </div>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: 180,
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                zIndex: 200,
                animation: 'fadeIn 0.15s ease',
              }}
            >
              {[
                { label: 'Profile',  icon: User,     action: () => setDropdownOpen(false) },
                { label: 'Settings', icon: Settings,  action: () => setDropdownOpen(false) },
              ].map(({ label, icon: Icon, action }) => (
                <button
                  key={label}
                  onClick={action}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 14px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    transition: 'background 0.1s ease, color 0.1s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-elevated)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
              <button
                onClick={() => { logout(); setDropdownOpen(false) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--red)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--red-dim)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
