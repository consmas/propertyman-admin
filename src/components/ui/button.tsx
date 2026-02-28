import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[var(--brand-600)] text-[var(--text-inverse)] hover:bg-[var(--brand-700)] shadow-sm',
        destructive: 'bg-[var(--error-500)] text-[var(--text-inverse)] hover:bg-[var(--error-700)] shadow-sm',
        outline: 'border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] shadow-sm',
        secondary: 'bg-[var(--surface-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-default)]',
        ghost: 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]',
        link: 'text-[var(--text-brand)] underline-offset-4 hover:underline',
        success: 'bg-[var(--success-500)] text-[var(--text-inverse)] hover:bg-[var(--success-700)] shadow-sm',
        warning: 'bg-[var(--warning-500)] text-[var(--text-inverse)] hover:bg-[var(--warning-700)] shadow-sm',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
