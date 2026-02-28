import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  iconColor?: string
  iconBg?: string
  isLoading?: boolean
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50',
  isLoading,
}: KpiCardProps) {
  const safeValue = (() => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : '—'
    return value
  })()

  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--brand-300)] to-[var(--info-500)] opacity-70" />
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'rounded-xl p-2.5 ring-1 ring-inset ring-[var(--border-default)] transition-all duration-200 group-hover:scale-105',
            iconBg
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        {trend && (
          <span
            className={cn(
              'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
              trend.value >= 0
                ? 'bg-[var(--success-50)] text-[var(--success-700)] ring-[var(--success-500)]/20'
                : 'bg-[var(--error-50)] text-[var(--error-700)] ring-[var(--error-500)]/20'
            )}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="font-mono text-3xl font-bold tracking-tight text-[var(--text-primary)]">{safeValue}</p>
        <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-[var(--text-tertiary)]">{subtitle}</p>}
      </div>
    </Card>
  )
}
