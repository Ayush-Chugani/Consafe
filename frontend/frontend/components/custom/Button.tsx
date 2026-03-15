'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  children?: React.ReactNode
  className?: string
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--cyan)',
    color: '#000',
    border: '1px solid var(--cyan)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
  },
  secondary: {
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 500,
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent',
    fontFamily: 'var(--font-mono)',
    fontWeight: 400,
  },
  danger: {
    background: 'var(--red-dim)',
    color: 'var(--red)',
    border: '1px solid rgba(255,77,106,0.30)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 500,
  },
  outline: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-bright)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 500,
  },
}

const VARIANT_HOVER: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { background: '#00bde6', boxShadow: '0 0 16px var(--cyan-glow)' },
  secondary: { background: 'var(--bg-overlay)', borderColor: 'var(--border-bright)' },
  ghost:     { background: 'var(--bg-elevated)', color: 'var(--text-primary)' },
  danger:    { background: 'rgba(255,77,106,0.16)', boxShadow: '0 0 12px var(--red-glow)' },
  outline:   { background: 'var(--bg-elevated)', borderColor: 'var(--border-focus)' },
}

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '5px 12px', fontSize: 11, height: 30, gap: 5, borderRadius: 6 },
  md: { padding: '7px 16px', fontSize: 12, height: 36, gap: 6, borderRadius: 7 },
  lg: { padding: '9px 22px', fontSize: 13, height: 42, gap: 8, borderRadius: 8 },
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const vs = VARIANT_STYLES[variant]
  const vh = VARIANT_HOVER[variant]
  const ss = SIZE_STYLES[size]
  const isDisabled = disabled || loading

  const baseStyle: React.CSSProperties = {
    ...vs,
    ...ss,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
    letterSpacing: '0.03em',
    lineHeight: 1,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    ...style,
  }

  function handleMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
    if (isDisabled) return
    Object.assign(e.currentTarget.style, vh)
    rest.onMouseEnter?.(e)
  }
  function handleMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
    if (isDisabled) return
    const resetStyle: React.CSSProperties = {
      background: vs.background as string,
      color: vs.color as string,
      boxShadow: 'none',
      borderColor: (vs.border as string | undefined) ?? 'transparent',
    }
    Object.assign(e.currentTarget.style, resetStyle)
    rest.onMouseLeave?.(e)
  }

  const iconEl = loading ? (
    <Loader2
      size={size === 'sm' ? 12 : size === 'lg' ? 15 : 13}
      style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
    />
  ) : icon ? (
    <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
  ) : null

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={className}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {iconEl && iconPosition === 'left' && iconEl}
      {children}
      {iconEl && iconPosition === 'right' && iconEl}
    </button>
  )
}
