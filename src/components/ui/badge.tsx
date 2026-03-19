import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em]',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--brand-100)] text-[var(--brand-700)]',
        success:
          'bg-[var(--success-50)] text-[var(--success-700)]',
        warning:
          'bg-[var(--warning-50)] text-[var(--warning-700)]',
        danger:
          'bg-[var(--error-50)] text-[var(--error-700)]',
        gray:
          'bg-[var(--surface-tertiary)] text-[var(--text-secondary)]',
        blue:
          'bg-[var(--info-50)] text-[var(--info-700)]',
        purple:
          'bg-[var(--brand-100)] text-[var(--brand-800)]',
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
