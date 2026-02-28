import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({
  title = 'No results found',
  description = 'There are no items to display here.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] px-6 py-16 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-xl bg-[var(--surface-tertiary)] p-4 text-[var(--text-tertiary)]">
        {icon ?? <Inbox className="h-8 w-8" />}
      </div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
