import type { CreateUnitRequest, CreateUserRequest, UserRole } from '@/types/api'

export interface CreateUserInput {
  full_name: string
  email: string
  role: UserRole
  password?: string
  phone?: string
  status?: 'active' | 'inactive'
}

export function toCreateUserRequest(input: CreateUserInput): CreateUserRequest {
  return {
    user: {
      full_name: input.full_name,
      email: input.email,
      role: input.role,
      password: input.password,
      phone: input.phone,
      status: input.status,
    },
  }
}

export interface CreateUnitInput {
  property_id: string
  unit_number: string
  rent: number
  unit_type?: string
  status?: 'vacant' | 'occupied' | 'maintenance' | 'reserved'
  notes?: string
}

export function toCreateUnitRequest(input: CreateUnitInput): CreateUnitRequest {
  return {
    unit: {
      property_id: input.property_id,
      unit_number: input.unit_number,
      unit_type: input.unit_type,
      monthly_rent: input.rent,
      status: input.status ?? 'vacant',
      notes: input.notes,
    },
  }
}
