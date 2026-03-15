'use client'

import React from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'

interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  className,
  style,
}: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '7px 12px',
          height: 36,
          borderRadius: 7,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          outline: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          minWidth: 120,
          ...style,
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
            overflow: 'hidden',
            zIndex: 500,
            minWidth: 'var(--radix-select-trigger-width)',
            maxHeight: 280,
            animation: 'fadeIn 0.12s ease',
          }}
        >
          <RadixSelect.ScrollUpButton
            style={{ display: 'flex', justifyContent: 'center', padding: 4, color: 'var(--text-muted)' }}
          >
            ▲
          </RadixSelect.ScrollUpButton>

          <RadixSelect.Viewport style={{ padding: '4px 0' }}>
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: opt.disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
                  cursor: opt.disabled ? 'not-allowed' : 'pointer',
                  outline: 'none',
                  transition: 'background 0.1s ease, color 0.1s ease',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!opt.disabled) {
                    e.currentTarget.style.background = 'var(--bg-elevated)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = opt.disabled ? 'var(--text-muted)' : 'var(--text-secondary)'
                }}
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check size={11} style={{ color: 'var(--cyan)' }} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>

          <RadixSelect.ScrollDownButton
            style={{ display: 'flex', justifyContent: 'center', padding: 4, color: 'var(--text-muted)' }}
          >
            ▼
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
