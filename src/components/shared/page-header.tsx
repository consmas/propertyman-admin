import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  kicker?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, kicker, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        {kicker && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            {kicker}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>}
      </div>
      {actions && <div className="mt-2 flex items-center gap-2 sm:mt-0">{actions}</div>}
    </div>
  )
}
