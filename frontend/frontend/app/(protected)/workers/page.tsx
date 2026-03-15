'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Users, Shield, ShieldOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { workerService } from '@/api/services/workerService'
import { Card } from '@/components/custom/Card'
import { Badge } from '@/components/custom/Badge'
import { Button } from '@/components/custom/Button'
import { complianceColor } from '@/lib/utils'

export default function WorkersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [page, setPage] = useState(1)
  const limit = 24

  const { data: workersData, isLoading } = useQuery({
    queryKey: ['workers', search, department, page],
    queryFn: () => workerService.list({ search: search || undefined, department: department || undefined, page, limit }),
    placeholderData: (prev) => prev,
  })

  const workers = workersData?.data ?? []
  const total = workersData?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  const departments = [...new Set(workers.map((w) => w.department))].filter(Boolean)

  return (
    <div>
      {/* Page header */}
      <div data-reveal="" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', marginBottom: 6 }}>
            Workers
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {total} registered workers across all departments
          </p>
        </div>
        <Button variant="primary" size="md" icon={<Plus size={13} />}>
          Add Worker
        </Button>
      </div>

      {/* Search + filter bar */}
      <div data-reveal="" style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '8px 12px', flex: 1, minWidth: 200,
        }}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none', width: '100%',
            }}
          />
        </div>

        <select
          value={department}
          onChange={(e) => { setDepartment(e.target.value); setPage(1) }}
          style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
            fontSize: 13, borderRadius: 8, padding: '8px 12px', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Workers grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20, height: 120,
              animation: 'fadeIn 1s ease infinite alternate',
            }} />
          ))}
        </div>
      ) : workers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Users size={32} style={{ color: 'var(--text-dim)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            No workers found
          </p>
        </div>
      ) : (
        <div
          data-reveal=""
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}
        >
          {workers.map((worker) => (
            <div
              key={worker.id}
              onClick={() => router.push(`/workers/${worker.id}`)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 18,
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'var(--border-bright)'
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'var(--border)'
                el.style.transform = 'none'
                el.style.boxShadow = 'none'
              }}
            >
              {/* Inactive overlay */}
              {!worker.isActive && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(6,7,9,0.5)',
                  borderRadius: 12,
                  zIndex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Badge variant="red">Inactive</Badge>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--cyan-dim)',
                  border: '2px solid var(--cyan-border)',
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--cyan)',
                }}>
                  {worker.referencePhotoUrl ? (
                    <img src={worker.referencePhotoUrl} alt={worker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    worker.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {worker.name}
                    </p>
                    {worker.faceEmbeddingId ? (
                      <span title="Face enrolled"><Shield size={12} style={{ color: 'var(--green)', flexShrink: 0 }} /></span>
                    ) : (
                      <span title="Face not enrolled"><ShieldOff size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} /></span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {worker.workerCode}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                    {worker.jobTitle}
                  </p>
                </div>
              </div>

              {/* Bottom row: department + safety score */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                <Badge variant="default">{worker.department}</Badge>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Score:</span>
                  <span style={{
                    fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600,
                    color: complianceColor(worker.safetyScore),
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {worker.safetyScore.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 28 }}>
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}
            icon={<ChevronLeft size={12} />}>Prev</Button>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {page} / {totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            icon={<ChevronRight size={12} />} iconPosition="right">Next</Button>
        </div>
      )}
    </div>
  )
}
