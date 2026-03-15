'use client'

import React from 'react'

type GlowColor = 'cyan' | 'green' | 'red' | 'amber'

interface CardProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  headerBorder?: boolean
  glowColor?: GlowColor
  className?: string
  children: React.ReactNode
  'data-reveal'?: string
  style?: React.CSSProperties
}

const GLOW_SHADOWS: Record<GlowColor, string> = {
  cyan:  '0 0 28px var(--cyan-glow)',
  green: '0 0 28px var(--green-glow)',
  red:   '0 0 28px var(--red-glow)',
  amber: '0 0 28px var(--amber-glow)',
}

const GLOW_BORDER: Record<GlowColor, string> = {
  cyan:  'rgba(0,212,255,0.30)',
  green: 'rgba(0,229,160,0.25)',
  red:   'rgba(255,77,106,0.25)',
  amber: 'rgba(245,158,11,0.25)',
}

export function Card({
  title,
  subtitle,
  action,
  headerBorder = true,
  glowColor,
  className,
  children,
  style,
  ...rest
}: CardProps) {
  const hasHeader = !!(title || subtitle || action)

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-surface)',
    border: `1px solid ${glowColor ? GLOW_BORDER[glowColor] : 'var(--border)'}`,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: glowColor ? GLOW_SHADOWS[glowColor] : undefined,
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    ...style,
  }

  return (
    <div
      className={className}
      style={cardStyle}
      data-reveal={rest['data-reveal']}
    >
      {hasHeader && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: headerBorder ? '1px solid var(--border)' : undefined,
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  marginTop: 2,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          {action && (
            <div style={{ flexShrink: 0 }}>
              {action}
            </div>
          )}
        </div>
      )}
      <div style={{ padding: hasHeader ? '16px 20px' : 20 }}>
        {children}
      </div>
    </div>
  )
}
