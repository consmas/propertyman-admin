import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <input
          id={id}
          className={cn(
            'flex h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-1 text-sm text-[var(--text-primary)] shadow-sm transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-focus)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[var(--error-500)] focus:border-[var(--error-500)]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-[var(--error-500)]">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
