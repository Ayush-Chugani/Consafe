'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/api/services/adminService'
import type { AuditLogEntry } from '@/api/types'

const ACTION_CONFIG: Record<string, { color: string; bg: string }> = {
  CREATE:  { color: 'var(--green)',  bg: 'var(--green-dim)'  },
  UPDATE:  { color: 'var(--cyan)',   bg: 'var(--cyan-dim)'   },
  DELETE:  { color: 'var(--red)',    bg: 'var(--red-dim)'    },
  LOGIN:   { color: 'var(--text-secondary)', bg: 'rgba(123,133,158,0.08)' },
  LOGOUT:  { color: 'var(--text-muted)',     bg: 'rgba(66,74,94,0.15)'   },
  EXPORT:  { color: 'var(--amber)',  bg: 'var(--amber-dim)'  },
  DEFAULT: { color: 'var(--violet)', bg: 'var(--violet-dim)' },
}

function getActionConfig(action: string) {
  const key = action.split('_')[0].toUpperCase()
  return ACTION_CONFIG[key] ?? ACTION_CONFIG.DEFAULT
}

const PAGE_SIZE = 20

export default function AuditLogTable() {
  const [page, setPage] = useState(1)
  const [adminFilter, setAdminFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', page, adminFilter, actionFilter],
    queryFn: () =>
      adminService.auditLog({
        page,
        limit: PAGE_SIZE,
        adminId: adminFilter || undefined,
        action: actionFilter || undefined,
      }),
    placeholderData: (prev) => prev,
  })

  const logs: AuditLogEntry[] = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  const thStyle: React.CSSProperties = {
    padding: '10px 12px',
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
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Filter by admin email…"
          value={adminFilter}
          onChange={(e) => { setAdminFilter(e.target.value); setPage(1) }}
          style={{
            padding: '6px 12px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 5,
            color: 'var(--text-primary)', fontFamily: "'DM Mono', monospace", fontSize: 11,
            outline: 'none', minWidth: 200,
          }}
        />
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
          style={{
            padding: '6px 12px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 5,
            color: 'var(--text-primary)', fontFamily: "'DM Mono', monospace", fontSize: 11,
            outline: 'none',
          }}
        >
          <option value="">ALL ACTIONS</option>
          {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT'].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            padding: '5px 10px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 5,
            color: 'var(--text-primary)', fontFamily: "'DM Mono', monospace", fontSize: 11,
            outline: 'none',
          }}
        />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>–</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            padding: '5px 10px', background: 'var(--bg-elevated)',
            border: '1px solid var(--border)', borderRadius: 5,
            color: 'var(--text-primary)', fontFamily: "'DM Mono', monospace", fontSize: 11,
            outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>ADMIN</th>
              <th style={thStyle}>ACTION</th>
              <th style={thStyle}>RESOURCE TYPE</th>
              <th style={thStyle}>TARGET ID</th>
              <th style={thStyle}>TIMESTAMP</th>
              <th style={thStyle}>IP ADDRESS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ height: 11, background: 'var(--border)', borderRadius: 3 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                  NO AUDIT LOGS FOUND
                </td>
              </tr>
            ) : (
              logs.map((entry, i) => {
                const cfg = getActionConfig(entry.action)
                return (
                  <tr
                    key={entry.id}
                    style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}
                    onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay, #1a2035)' }}
                    onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}
                  >
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--text-primary)' }}>
                      {entry.admin?.name ?? entry.adminId.slice(0, 8)}
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{
                        padding: '2px 7px', borderRadius: 4,
                        background: cfg.bg, border: `1px solid ${cfg.color}33`,
                        fontFamily: "'DM Mono', monospace", fontSize: 9,
                        color: cfg.color, letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}>
                        {entry.action}
                      </span>
                    </td>
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--text-secondary)' }}>
                      {entry.resourceType}
                    </td>
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', fontFamily: "'Roboto Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>
                      {entry.resourceId ? entry.resourceId.slice(0, 12) + '…' : '—'}
                    </td>
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', fontFamily: "'Roboto Mono', monospace", fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(entry.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', fontFamily: "'Roboto Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                      {entry.ipAddress}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '5px 12px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: 5,
              color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            PREV
          </button>
          <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 12, color: 'var(--text-secondary)' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '5px 12px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: 5,
              color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            NEXT
          </button>
        </div>
      )}
    </div>
  )
}
