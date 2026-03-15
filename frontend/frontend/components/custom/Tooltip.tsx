'use client'

import React from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'

type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: TooltipSide
  delayDuration?: number
  className?: string
}

export function Tooltip({
  children,
  content,
  side = 'top',
  delayDuration = 200,
  className,
}: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <span className={className} style={{ display: 'inline-flex' }}>
            {children}
          </span>
        </RadixTooltip.Trigger>

        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={6}
            style={{
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              borderRadius: 7,
              padding: '6px 10px',
              fontSize: 11,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              maxWidth: 260,
              lineHeight: 1.4,
              zIndex: 600,
              animation: 'fadeIn 0.12s ease',
              userSelect: 'none',
            }}
          >
            {content}
            <RadixTooltip.Arrow
              style={{ fill: 'var(--border)' }}
              width={10}
              height={5}
            />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
