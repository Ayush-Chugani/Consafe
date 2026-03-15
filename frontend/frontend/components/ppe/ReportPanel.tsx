'use client'
import { useState } from 'react'
import { Copy, Check, Mail, MailX, Info } from 'lucide-react'
import type { EmailStatus } from '@/api/types'

interface Props {
  reportText: string
  emailStatus: EmailStatus
  onDownload: () => void
}

export default function ReportPanel({ reportText, emailStatus }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const lineCount = reportText.split('\n').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Report Text ── */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>ANALYSIS REPORT</span>
            <span style={{ padding: '1px 6px', borderRadius: 3, background: 'var(--bg-elevated)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
              {lineCount} lines
            </span>
          </div>
          <button
            onClick={handleCopy}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: copied ? 'var(--green-dim)' : 'var(--bg-elevated)', border: `1px solid ${copied ? 'rgba(0,229,160,0.4)' : 'var(--border)'}`, borderRadius: 5, color: copied ? 'var(--green)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, transition: 'all 0.2s' }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <textarea
          readOnly
          value={reportText}
          style={{
            width: '100%', height: 220, padding: '14px 16px', resize: 'none',
            background: 'var(--bg-void)', color: 'var(--green)', fontFamily: 'var(--font-mono)',
            fontSize: 11, lineHeight: 1.7, border: 'none', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* ── Email Status ── */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>EMAIL DELIVERY</span>
        </div>
        <div style={{ padding: '14px 16px' }}>
          {!emailStatus.recipient ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Info size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
                No recipient email provided — email delivery was skipped
              </p>
            </div>
          ) : emailStatus.ok ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green-dim)', border: '1px solid rgba(0,229,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={13} style={{ color: 'var(--green)' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                    Report sent to <span style={{ color: 'var(--green)' }}>{emailStatus.recipient}</span>
                  </p>
                  {emailStatus.status_code && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Status {emailStatus.status_code}</p>
                  )}
                </div>
              </div>
              {emailStatus.body && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', paddingLeft: 38 }}>{emailStatus.body}</p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--red-dim)', border: '1px solid rgba(255,77,106,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MailX size={13} style={{ color: 'var(--red)' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                    Failed to deliver to <span style={{ color: 'var(--red)' }}>{emailStatus.recipient}</span>
                  </p>
                  {emailStatus.error && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', marginTop: 2 }}>{emailStatus.error}</p>
                  )}
                </div>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', paddingLeft: 38 }}>Analysis results are unaffected — only email delivery failed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
