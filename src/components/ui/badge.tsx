import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      variant: {
        default: 'bg-[var(--brand-50)] text-[var(--brand-700)] ring-[var(--brand-200)]',
        success: 'bg-[var(--success-50)] text-[var(--success-700)] ring-[var(--success-500)]/20',
        warning: 'bg-[var(--warning-50)] text-[var(--warning-700)] ring-[var(--warning-500)]/20',
        danger: 'bg-[var(--error-50)] text-[var(--error-700)] ring-[var(--error-500)]/20',
        gray: 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)] ring-[var(--border-default)]',
        blue: 'bg-[var(--info-50)] text-[var(--info-700)] ring-[var(--info-500)]/20',
        purple: 'bg-[var(--brand-100)] text-[var(--brand-800)] ring-[var(--brand-300)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
