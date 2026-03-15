'use client'

import React from 'react'
import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        gap: 10,
        textAlign: 'center',
      }}
    >
      {/* Icon */}
      <div
        style={{
          color: 'var(--text-muted)',
          opacity: 0.4,
          marginBottom: 4,
        }}
      >
        {icon ?? <PackageOpen size={36} strokeWidth={1.2} />}
      </div>

      {/* Title */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-secondary)',
          letterSpacing: '0.03em',
        }}
      >
        {title}
      </div>

      {/* Description */}
      {description && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            maxWidth: 300,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      )}

      {/* Action */}
      {action && (
        <div style={{ marginTop: 8 }}>
          {action}
        </div>
      )}
    </div>
  )
}
