'use client'

import React, { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { EmptyState } from '@/components/custom/EmptyState'

/* ─── Types ─────────────────────────────────────────────────── */
export interface Column<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
  width?: string
}

interface DataTableProps<T extends object> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  pageSize?: number
  total?: number
  page?: number
  onPageChange?: (page: number) => void
  onSort?: (key: string, dir: 'asc' | 'desc') => void
  rowKey: keyof T
  onRowClick?: (row: T) => void
}

/* ─── Skeleton row ──────────────────────────────────────────── */
function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div
            style={{
              height: 12,
              borderRadius: 4,
              background: 'var(--bg-elevated)',
              width: i === 0 ? '40%' : i === 1 ? '60%' : '50%',
              animation: 'shimmer 1.4s ease infinite',
              backgroundImage: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-overlay) 50%, var(--bg-elevated) 75%)',
              backgroundSize: '200% 100%',
            }}
          />
        </td>
      ))}
    </tr>
  )
}

/* ─── DataTable ─────────────────────────────────────────────── */
export function DataTable<T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  pageSize = 20,
  total,
  page = 1,
  onPageChange,
  onSort,
  rowKey,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const totalPages = total !== undefined ? Math.ceil(total / pageSize) : undefined
  const effectiveTotal = total ?? data.length

  function handleSort(key: string) {
    if (!onSort) return
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'
    setSortKey(key)
    setSortDir(newDir)
    onSort(key, newDir)
  }

  function getCellValue(row: T, key: keyof T | string): unknown {
    return (row as Record<string, unknown>)[key as string]
  }

  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontWeight: 500,
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    textAlign: 'left',
    background: 'var(--bg-elevated)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  }

  const tdStyle: React.CSSProperties = {
    padding: '11px 16px',
    fontSize: 12,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Scrollable table area */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'auto',
          }}
        >
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  style={{
                    ...thStyle,
                    width: col.width,
                    cursor: col.sortable && onSort ? 'pointer' : 'default',
                  }}
                  onClick={() => col.sortable && handleSort(col.key as string)}
                  onMouseEnter={(e) => {
                    if (col.sortable && onSort) {
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.header}
                    {col.sortable && onSort && (
                      <span style={{ color: 'var(--text-muted)', display: 'inline-flex' }}>
                        {sortKey === col.key
                          ? sortDir === 'asc'
                            ? <ChevronUp size={11} style={{ color: 'var(--cyan)' }} />
                            : <ChevronDown size={11} style={{ color: 'var(--cyan)' }} />
                          : <ChevronsUpDown size={10} />
                        }
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} colCount={columns.length} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '40px 16px', textAlign: 'center' }}>
                  <EmptyState title={emptyMessage} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => {
                const key = String(getCellValue(row, rowKey as keyof T) ?? rowIdx)
                return (
                  <tr
                    key={key}
                    style={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background 0.1s ease',
                    }}
                    onClick={() => onRowClick?.(row)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-elevated)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {columns.map((col) => (
                      <td key={col.key as string} style={tdStyle}>
                        {col.render
                          ? col.render(row)
                          : String(getCellValue(row, col.key) ?? '—')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages !== undefined && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {effectiveTotal} records &nbsp;·&nbsp; page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                if (i > 0 && typeof arr[i - 1] === 'number' && (p as number) - (arr[i - 1] as number) > 1) {
                  acc.push('ellipsis')
                }
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === 'ellipsis' ? (
                  <span key={`e${i}`} style={{ color: 'var(--text-muted)', fontSize: 11, padding: '0 4px', alignSelf: 'center' }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onPageChange?.(p as number)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 5,
                      border: '1px solid',
                      borderColor: p === page ? 'var(--cyan)' : 'var(--border)',
                      background: p === page ? 'var(--cyan-dim)' : 'transparent',
                      color: p === page ? 'var(--cyan)' : 'var(--text-secondary)',
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                      if (p !== page) {
                        e.currentTarget.style.borderColor = 'var(--border-bright)'
                        e.currentTarget.style.color = 'var(--text-primary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (p !== page) {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                      }
                    }}
                  >
                    {p}
                  </button>
                )
              )}
          </div>
        </div>
      )}
    </div>
  )
}
