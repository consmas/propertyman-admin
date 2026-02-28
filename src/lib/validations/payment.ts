import { z } from 'zod'

export const recordPaymentSchema = z.object({
  tenant_id: z.string().min(1, 'Tenant is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  payment_date: z.string().min(1, 'Payment date is required'),
  payment_method: z.enum(['cash', 'bank_transfer', 'mobile_money', 'cheque', 'card'], {
    required_error: 'Payment method is required',
  }),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
})

export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>
