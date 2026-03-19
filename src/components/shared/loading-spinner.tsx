import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }

export function LoadingSpinner({ className, size = 'md', label }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <svg
        className={cn('animate-spin text-[var(--brand-600)]', sizeMap[size])}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label && <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex h-64 w-full flex-col items-center justify-center gap-3">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-700))' }}
      >
        <span className="font-display text-lg font-bold text-white">P</span>
      </div>
      <LoadingSpinner size="md" />
    </div>
  )
}
