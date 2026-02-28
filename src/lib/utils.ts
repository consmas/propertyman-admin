import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: string | number, currency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'GHS'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return `${currency} 0.00`
  return `${currency} ${num.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(dateStr: string | null | undefined, fmt = 'MMM d, yyyy'): string {
  if (!dateStr) return '—'
  try {
    return format(parseISO(dateStr), fmt)
  } catch {
    return '—'
  }
}

export function formatRelativeDate(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch {
    return '—'
  }
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

/** Format cents (integer) into display currency */
export function formatCents(cents: number | undefined | null, currency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'GHS'): string {
  if (cents == null) return `${currency} 0.00`
  return formatCurrency(cents / 100, currency)
}

/** Convert user-entered decimal amount to integer cents */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/** Get initials from a full_name string or first/last pair */
export function getInitials(nameOrFirst?: string, last?: string): string {
  if (!nameOrFirst) return '??'
  if (last !== undefined) {
    // Called with (firstName, lastName)
    return `${nameOrFirst[0] ?? ''}${last[0] ?? ''}`.toUpperCase() || '??'
  }
  // Called with full_name — split on first space
  const parts = nameOrFirst.trim().split(' ')
  const f = parts[0]?.[0] ?? ''
  const l = parts[1]?.[0] ?? ''
  return `${f}${l}`.toUpperCase() || '??'
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function humanizeStatus(status: string | null | undefined): string {
  if (!status) return '—'
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return `${str.slice(0, length)}…`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildQueryString(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (!entries.length) return ''
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
}
