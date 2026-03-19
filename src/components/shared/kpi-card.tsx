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
  accent?: string
  chartData?: number[]
  isLoading?: boolean
  delay?: number
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-[3px] h-10 w-20">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-500"
          style={{
            height: `${(v / max) * 100}%`,
            background: color,
            opacity: 0.3 + (v / max) * 0.7,
            transitionDelay: `${i * 40}ms`,
            minHeight: 2,
          }}
        />
      ))}
    </div>
  )
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = 'var(--brand-600)',
  chartData,
  isLoading,
  delay = 0,
}: KpiCardProps) {
  const safeValue = (() => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : '—'
    return value
  })()

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-md" />
        </div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-32" />
      </Card>
    )
  }

  return (
    <Card
      className="fade-up p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${accent}18`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
        {chartData && chartData.length > 0 && (
          <MiniChart data={chartData} color={accent} />
        )}
        {trend && !chartData && (
          <span
            className={cn(
              'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
              trend.value >= 0
                ? 'bg-[var(--success-50)] text-[var(--success-700)]'
                : 'bg-[var(--error-50)] text-[var(--error-700)]'
            )}
          >
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
      <p
        className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] leading-none mb-1"
      >
        {safeValue}
      </p>
      <p className="text-[13px] font-semibold text-[var(--text-secondary)]">{title}</p>
      {subtitle && (
        <p className="mt-1.5 text-xs font-semibold" style={{ color: accent }}>
          {subtitle}
        </p>
      )}
    </Card>
  )
}
