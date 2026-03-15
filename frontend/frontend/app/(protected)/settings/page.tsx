'use client'
import type { ReactNode } from 'react'
import { Card } from '@/components/custom/Card'
import { Badge } from '@/components/custom/Badge'
import { Button } from '@/components/custom/Button'
import { Settings2, Server, Bell, Info, Globe, Lock, Database, RefreshCw } from 'lucide-react'

function SectionHeader({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: 'var(--cyan-dim)', border: '1px solid var(--cyan-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--cyan)',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          {title}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
          {description}
        </p>
      </div>
    </div>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 0', borderBottom: '1px solid var(--border-dim)',
    }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
          {label}
        </p>
        {description && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            {description}
          </p>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>
        {children}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 42, height: 24, borderRadius: 12,
        background: checked ? 'var(--cyan)' : 'var(--border)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: checked ? 21 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: checked ? '#000' : 'var(--text-muted)',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

export default function SettingsPage() {
  return (
    <div>
      {/* Page header */}
      <div data-reveal="" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)' }}>
            System Settings
          </h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          Configure platform behavior, integrations, and notification preferences
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* API Configuration */}
        <Card data-reveal="">
          <SectionHeader
            icon={<Server size={16} />}
            title="API Configuration"
            description="Backend connection and inference settings"
          />
          <SettingRow
            label="API Base URL"
            description="The backend server endpoint"
          >
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '6px 12px',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)',
            }}>
              {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}
            </div>
          </SettingRow>
          <SettingRow
            label="Connection Status"
            description="Current API server health"
          >
            <Badge variant="green" dot pulse>Connected</Badge>
          </SettingRow>
          <SettingRow
            label="Default Confidence Threshold"
            description="Used for new PPE analysis jobs"
          >
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '6px 12px',
              fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)',
            }}>
              0.25
            </div>
          </SettingRow>
          <SettingRow
            label="Default IoU Threshold"
            description="Used for non-maximum suppression"
          >
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '6px 12px',
              fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)',
            }}>
              0.45
            </div>
          </SettingRow>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <Button variant="primary" size="sm" icon={<RefreshCw size={12} />}>Test Connection</Button>
            <Button variant="secondary" size="sm">Save Changes</Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card data-reveal="">
          <SectionHeader
            icon={<Bell size={16} />}
            title="Notification Settings"
            description="Configure alerts and notification delivery"
          />
          <SettingRow
            label="PPE Violation Alerts"
            description="Send alerts when PPE violations are detected"
          >
            <Toggle checked={true} onChange={() => {}} />
          </SettingRow>
          <SettingRow
            label="Attendance Anomaly Alerts"
            description="Alert on unusual attendance patterns"
          >
            <Toggle checked={true} onChange={() => {}} />
          </SettingRow>
          <SettingRow
            label="Job Completion Notifications"
            description="Notify when video analysis jobs complete"
          >
            <Toggle checked={false} onChange={() => {}} />
          </SettingRow>
          <SettingRow
            label="Daily Summary Email"
            description="Receive daily compliance summary at midnight"
          >
            <Toggle checked={true} onChange={() => {}} />
          </SettingRow>
          <SettingRow
            label="Email Notifications"
            description="Recipient email for system notifications"
          >
            <Button variant="secondary" size="sm">Configure</Button>
          </SettingRow>
        </Card>

        {/* Security Settings */}
        <Card data-reveal="">
          <SectionHeader
            icon={<Lock size={16} />}
            title="Security & Access"
            description="Authentication and session management"
          />
          <SettingRow
            label="Session Timeout"
            description="Auto-logout after inactivity"
          >
            <select style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
              fontSize: 12, borderRadius: 6, padding: '6px 10px', outline: 'none', cursor: 'pointer',
            }}>
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>4 hours</option>
              <option>Never</option>
            </select>
          </SettingRow>
          <SettingRow
            label="Two-Factor Authentication"
            description="Require 2FA for admin accounts"
          >
            <Toggle checked={false} onChange={() => {}} />
          </SettingRow>
          <SettingRow
            label="Audit Logging"
            description="Log all admin actions for compliance"
          >
            <Toggle checked={true} onChange={() => {}} />
          </SettingRow>
          <SettingRow
            label="IP Allowlist"
            description="Restrict admin access to specific IP ranges"
          >
            <Button variant="secondary" size="sm">Manage</Button>
          </SettingRow>
        </Card>

        {/* System Information */}
        <Card data-reveal="">
          <SectionHeader
            icon={<Info size={16} />}
            title="System Information"
            description="Platform version and runtime details"
          />
          {[
            { label: 'Application', value: 'PPE Analytics Platform' },
            { label: 'Version', value: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0' },
            { label: 'Environment', value: process.env.NODE_ENV ?? 'development' },
            { label: 'API Version', value: 'v1' },
            { label: 'Build', value: new Date().toLocaleDateString('en-US') },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--border-dim)',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                {label}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {value}
              </span>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <Button variant="danger" size="sm" icon={<Database size={12} />}>
              Clear Cache
            </Button>
          </div>
        </Card>
      </div>

      {/* Camera Configuration */}
      <Card title="Camera Configuration" subtitle="Manage connected cameras and locations" data-reveal="" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Globe size={18} style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              No cameras configured. Add cameras to enable automatic face detection and attendance tracking.
            </p>
          </div>
          <Button variant="primary" size="sm">Add Camera</Button>
        </div>
      </Card>
    </div>
  )
}
