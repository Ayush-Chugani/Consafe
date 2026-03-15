'use client'
import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [shaking, setShaking]   = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const { login, isLoading } = useAuthStore()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      await login(email, password)
      // Brief scale-out animation before redirect
      if (cardRef.current) {
        cardRef.current.style.transform = 'scale(0.97)'
        cardRef.current.style.opacity = '0'
        cardRef.current.style.transition = 'transform 0.2s, opacity 0.2s'
      }
      setTimeout(() => router.push(redirect), 220)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid email or password'
      setError(msg)
      setShaking(true)
      setTimeout(() => setShaking(false), 600)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* ── Cyan top bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2,
        background: 'var(--cyan)', zIndex: 9999,
        boxShadow: '0 0 12px var(--cyan-glow)',
      }} />

      {/* ── Login card ── */}
      <div
        ref={cardRef}
        className={shaking ? 'shake' : ''}
        style={{
          width: '100%', maxWidth: 420,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '40px 36px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px var(--border-dim)',
          transition: 'transform 0.2s, opacity 0.2s',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center mb-4 rounded-xl"
            style={{
              width: 52, height: 52,
              background: 'var(--cyan-dim)',
              border: '1.5px solid var(--cyan-border)',
              boxShadow: '0 0 24px var(--cyan-glow)',
            }}
          >
            <Shield size={26} style={{ color: 'var(--cyan)' }} />
          </div>

          <h1
            className="font-display font-bold tracking-wider text-center"
            style={{ fontSize: 20, color: 'var(--text-primary)' }}
          >
            PPE ANALYTICS
          </h1>
          <p
            className="font-mono text-center mt-1"
            style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em' }}
          >
            ADMIN ACCESS — AUTHORIZED PERSONNEL ONLY
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded text-sm"
            style={{
              background: 'var(--red-dim)',
              border: '1px solid var(--red-glow)',
              color: 'var(--red)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              className="block text-xs font-mono mb-1.5"
              style={{ color: 'var(--text-secondary)', letterSpacing: '0.08em' }}
            >
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              required
              autoComplete="email"
              className="w-full px-3 py-2.5 rounded text-sm transition-all outline-none"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--cyan-border)'
                e.target.style.boxShadow = '0 0 0 3px var(--cyan-dim)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-xs font-mono mb-1.5"
              style={{ color: 'var(--text-secondary)', letterSpacing: '0.08em' }}
            >
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2.5 pr-10 rounded text-sm transition-all outline-none"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--cyan-border)'
                  e.target.style.boxShadow = '0 0 0 3px var(--cyan-dim)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="checkbox"
              aria-checked={remember}
              onClick={() => setRemember(!remember)}
              className="flex items-center justify-center rounded transition-all"
              style={{
                width: 16, height: 16, flexShrink: 0,
                background: remember ? 'var(--cyan)' : 'var(--bg-elevated)',
                border: `1px solid ${remember ? 'var(--cyan)' : 'var(--border)'}`,
              }}
            >
              {remember && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </button>
            <span
              className="text-xs cursor-pointer select-none"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
              onClick={() => setRemember(!remember)}
            >
              Remember me
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded font-mono font-medium tracking-widest text-sm transition-all mt-2"
            style={{
              background: isLoading ? 'var(--border)' : 'var(--cyan)',
              color: isLoading ? 'var(--text-muted)' : '#000',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: 12,
              letterSpacing: '0.12em',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.boxShadow = '0 0 20px var(--cyan-glow)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {isLoading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>

        {/* Footer */}
        <p
          className="text-center mt-6 font-mono"
          style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.08em' }}
        >
          PPE ANALYTICS PLATFORM · RESTRICTED ACCESS
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
