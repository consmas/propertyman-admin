import { z } from 'zod'

export const createLeaseSchema = z.object({
  tenant_id: z.string().min(1, 'Tenant is required'),
  unit_id: z.string().min(1, 'Unit is required'),
  start_date: z.string().min(1, 'Start date is required'),
  duration_months: z.coerce.number().refine(v => [3, 6, 12].includes(v), {
    message: 'Duration must be 3, 6, or 12 months',
  }),
  monthly_rent: z.coerce.number().positive('Monthly rent must be positive'),
  security_deposit: z.coerce.number().min(0, 'Security deposit cannot be negative'),
})

export type CreateLeaseFormValues = z.infer<typeof createLeaseSchema>
