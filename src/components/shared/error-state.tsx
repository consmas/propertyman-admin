import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load data. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] px-6 py-16 text-center">
      <div className="mb-4 rounded-xl bg-[var(--error-50)] p-4 text-[var(--error-500)]">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
