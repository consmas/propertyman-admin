import { z } from 'zod'

export const createMaintenanceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Please provide more details (min 10 characters)'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.enum(['plumbing', 'electrical', 'structural', 'appliance', 'hvac', 'pest_control', 'cleaning', 'other']),
  unit_id: z.string().min(1, 'Unit is required'),
  tenant_id: z.string().optional(),
  estimated_cost: z.coerce.number().min(0).optional(),
})

export type CreateMaintenanceFormValues = z.infer<typeof createMaintenanceSchema>
