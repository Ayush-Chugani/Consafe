'use client'

import React from 'react'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'
type AvatarStatus = 'online' | 'offline' | 'away'

interface AvatarProps {
  src?: string
  name: string
  size?: AvatarSize
  status?: AvatarStatus
  className?: string
  style?: React.CSSProperties
}

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 72,
}

const FONT_SIZE: Record<AvatarSize, number> = {
  sm: 10,
  md: 13,
  lg: 17,
  xl: 26,
}

const STATUS_COLORS: Record<AvatarStatus, string> = {
  online:  'var(--green)',
  offline: 'var(--red)',
  away:    'var(--amber)',
}

const STATUS_DOT: Record<AvatarSize, number> = {
  sm: 7,
  md: 8,
  lg: 10,
  xl: 14,
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Generate a deterministic hue from name for fallback background */
function nameToHue(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

export function Avatar({ src, name, size = 'md', status, className, style }: AvatarProps) {
  const px = SIZE_PX[size]
  const dotPx = STATUS_DOT[size]
  const hue = nameToHue(name)

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          width: px,
          height: px,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: src ? 'transparent' : `hsl(${hue},40%,22%)`,
          border: status ? `2px solid ${STATUS_COLORS[status]}` : '1px solid var(--border)',
          flexShrink: 0,
          fontSize: FONT_SIZE[size],
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          color: src ? undefined : `hsl(${hue},70%,70%)`,
          userSelect: 'none',
          boxSizing: 'border-box',
        }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          getInitials(name)
        )}
      </div>

      {/* Status dot */}
      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: dotPx,
            height: dotPx,
            borderRadius: '50%',
            background: STATUS_COLORS[status],
            border: '2px solid var(--bg-surface)',
            boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  )
}
