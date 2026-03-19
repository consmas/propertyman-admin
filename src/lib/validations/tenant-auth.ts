import { z } from 'zod'

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  national_id: z.string().optional(),
  property_code: z.string().min(1, 'Property code is required'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
