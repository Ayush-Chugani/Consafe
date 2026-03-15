'use client'

import React from 'react'
import * as RadixSlider from '@radix-ui/react-slider'

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  label?: string
  showValue?: boolean
  disabled?: boolean
  className?: string
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = false,
  disabled = false,
  className,
}: SliderProps) {
  const displayValue = value.length === 1
    ? String(value[0])
    : `${value[0]} – ${value[value.length - 1]}`

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {label && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em',
              }}
            >
              {label}
            </span>
          )}
          {showValue && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--cyan)',
                fontFamily: 'var(--font-mono)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {displayValue}
            </span>
          )}
        </div>
      )}

      <RadixSlider.Root
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none',
          touchAction: 'none',
          width: '100%',
          height: 20,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {/* Track */}
        <RadixSlider.Track
          style={{
            position: 'relative',
            flexGrow: 1,
            borderRadius: 9999,
            height: 4,
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border)',
            overflow: 'visible',
          }}
        >
          {/* Range (filled portion) */}
          <RadixSlider.Range
            style={{
              position: 'absolute',
              background: 'var(--cyan)',
              borderRadius: 9999,
              height: '100%',
              boxShadow: '0 0 6px var(--cyan-glow)',
            }}
          />
        </RadixSlider.Track>

        {/* Thumbs */}
        {value.map((_, i) => (
          <RadixSlider.Thumb
            key={i}
            style={{
              display: 'block',
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'var(--cyan)',
              border: '2px solid var(--bg-surface)',
              boxShadow: '0 0 8px var(--cyan-glow)',
              outline: 'none',
              cursor: disabled ? 'not-allowed' : 'grab',
              transition: 'box-shadow 0.15s ease, transform 0.1s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--border-focus), 0 0 12px var(--cyan-glow)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = '0 0 8px var(--cyan-glow)'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(1.15)'
              e.currentTarget.style.cursor = 'grabbing'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.cursor = 'grab'
            }}
          />
        ))}
      </RadixSlider.Root>
    </div>
  )
}
