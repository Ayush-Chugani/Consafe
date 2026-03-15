'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Settings } from 'lucide-react'
import { useJobStore } from '@/store/jobStore'

function SliderRow({
  label, value, min, max, step, onChange, unit,
}: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--cyan)',
          }}
        >
          {value}{unit ?? ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          accentColor: 'var(--cyan)',
          height: 4,
          cursor: 'pointer',
        }}
      />
      <div
        style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          color: 'var(--text-muted)',
          marginTop: 3,
        }}
      >
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export default function InferenceSettingsPanel() {
  const [open, setOpen] = useState(false)
  const { settings, updateSettings } = useJobStore()

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 10,
        background: 'var(--bg-elevated)',
        overflow: 'hidden',
      }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '14px 18px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={14} style={{ color: 'var(--cyan)' }} />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: 'var(--text-primary)',
              letterSpacing: '0.08em',
            }}
          >
            INFERENCE SETTINGS
          </span>
        </div>
        {open ? (
          <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
        ) : (
          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
        )}
      </button>

      {/* Expandable content */}
      {open && (
        <div
          style={{
            padding: '4px 18px 18px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div style={{ marginTop: 16 }}>
            <SliderRow
              label="Confidence Threshold"
              value={settings.conf_threshold}
              min={0.05} max={0.95} step={0.05}
              onChange={(v) => updateSettings({ conf_threshold: v })}
            />
            <SliderRow
              label="IoU Threshold"
              value={settings.iou_threshold}
              min={0.10} max={0.90} step={0.05}
              onChange={(v) => updateSettings({ iou_threshold: v })}
            />
            <SliderRow
              label="Preview Every N Frames"
              value={settings.preview_stride}
              min={1} max={60} step={1}
              onChange={(v) => updateSettings({ preview_stride: v })}
              unit=" frames"
            />

            {/* Preview width */}
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.06em',
                  }}
                >
                  Preview Width
                </span>
                <span
                  style={{
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--cyan)',
                  }}
                >
                  {settings.preview_width}px
                </span>
              </div>
              <select
                value={settings.preview_width}
                onChange={(e) => updateSettings({ preview_width: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {[320, 480, 640, 960].map((w) => (
                  <option key={w} value={w}>{w}px</option>
                ))}
              </select>
            </div>

            {/* Draw center points toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.06em',
                }}
              >
                Draw Center Points
              </span>
              <button
                onClick={() => updateSettings({ draw_center_points: !settings.draw_center_points })}
                style={{
                  width: 42, height: 24,
                  borderRadius: 12,
                  background: settings.draw_center_points ? 'var(--cyan)' : 'var(--border)',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 3, left: settings.draw_center_points ? 21 : 3,
                    width: 18, height: 18,
                    borderRadius: '50%',
                    background: settings.draw_center_points ? '#000' : 'var(--text-muted)',
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
