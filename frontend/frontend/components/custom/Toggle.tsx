'use client'

import React from 'react'
import * as Switch from '@radix-ui/react-switch'

type ToggleSize = 'sm' | 'md'

interface ToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  size?: ToggleSize
  className?: string
}

const SIZE_CONFIG: Record<ToggleSize, { rootW: number; rootH: number; thumbSize: number; thumbOffset: number; fontSize: number }> = {
  sm: { rootW: 32, rootH: 18, thumbSize: 12, thumbOffset: 3, fontSize: 11 },
  md: { rootW: 40, rootH: 22, thumbSize: 16, thumbOffset: 3, fontSize: 12 },
}

export function Toggle({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  size = 'md',
  className,
}: ToggleProps) {
  const sc = SIZE_CONFIG[size]

  return (
    <label
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
      }}
    >
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          width: sc.rootW,
          height: sc.rootH,
          borderRadius: sc.rootH / 2,
          background: checked ? 'var(--cyan)' : 'var(--bg-overlay)',
          border: `1px solid ${checked ? 'rgba(0,212,255,0.4)' : 'var(--border)'}`,
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          boxShadow: checked ? '0 0 12px var(--cyan-glow)' : 'none',
          flexShrink: 0,
        }}
        onFocus={(e) => {
          if (!disabled) e.currentTarget.style.boxShadow = `0 0 0 2px var(--border-focus), ${checked ? '0 0 12px var(--cyan-glow)' : 'none'}`
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = checked ? '0 0 12px var(--cyan-glow)' : 'none'
        }}
      >
        <Switch.Thumb
          style={{
            display: 'block',
            width: sc.thumbSize,
            height: sc.thumbSize,
            borderRadius: '50%',
            background: checked ? '#000' : 'var(--text-muted)',
            transform: checked
              ? `translateX(${sc.rootW - sc.thumbSize - sc.thumbOffset}px)`
              : `translateX(${sc.thumbOffset}px)`,
            transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), background 0.2s ease',
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}
        />
      </Switch.Root>

      {label && (
        <span
          style={{
            fontSize: sc.fontSize,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {label}
        </span>
      )}
    </label>
  )
}
