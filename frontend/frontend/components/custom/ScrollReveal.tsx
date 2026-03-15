'use client'

import React, { useEffect, useRef } from 'react'

type RevealAnimation = 'fade' | 'left' | 'right' | 'scale' | 'stagger'

interface ScrollRevealProps {
  children: React.ReactNode
  animation?: RevealAnimation
  delay?: number
  className?: string
  style?: React.CSSProperties
}

const ANIMATION_CLASS: Record<RevealAnimation, string> = {
  fade:    'reveal',
  left:    'reveal-left',
  right:   'reveal-right',
  scale:   'reveal-scale',
  stagger: 'reveal-stagger',
}

function useScrollReveal() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

export function ScrollReveal({
  children,
  animation = 'fade',
  delay = 0,
  className = '',
  style,
}: ScrollRevealProps) {
  const ref = useScrollReveal()

  const classes = [ANIMATION_CLASS[animation], className].filter(Boolean).join(' ')

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={classes}
      data-reveal={animation}
      style={{
        animationDelay: delay > 0 ? `${delay}ms` : undefined,
        transitionDelay: delay > 0 ? `${delay}ms` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
