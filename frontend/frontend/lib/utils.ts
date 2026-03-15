import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export function complianceColor(pct: number): string {
  if (pct >= 90) return 'var(--green)'
  if (pct >= 70) return 'var(--amber)'
  return 'var(--red)'
}

export function getComplianceColor(pct: number): string {
  return complianceColor(pct)
}

export function complianceTextClass(pct: number): string {
  if (pct >= 90) return 'text-green'
  if (pct >= 70) return 'text-amber'
  return 'text-red'
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'present': return 'var(--green)'
    case 'late': return 'var(--amber)'
    case 'absent': return 'var(--red)'
    case 'on_leave': return 'var(--violet)'
    case 'completed': return 'var(--green)'
    case 'running': return 'var(--cyan)'
    case 'queued': return 'var(--amber)'
    case 'failed': return 'var(--red)'
    default: return 'var(--text-secondary)'
  }
}

export function trendColorClass(pct: number, inverted = false): string {
  const positive = pct >= 0
  const good = inverted ? !positive : positive
  return good ? 'text-green' : 'text-red'
}

export function truncate(str: string, maxLen: number): string {
  return str.length <= maxLen ? str : `${str.slice(0, maxLen - 3)}...`
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}

export function safeParseFloat(val: string | number | null | undefined, fallback = 0): number {
  const n = parseFloat(String(val))
  return isNaN(n) ? fallback : n
}
