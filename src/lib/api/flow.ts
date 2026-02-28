import type { CreateUnitRequest, CreateUserRequest, UserRole } from '@/types/api'
import { toCents } from '@/lib/utils'

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
  bedrooms: number
  bathrooms: number
  rent: number
  floor?: number | null
  area_sqft?: number | null
  status?: 'vacant' | 'occupied' | 'maintenance' | 'reserved'
  notes?: string
}

export function toCreateUnitRequest(input: CreateUnitInput): CreateUnitRequest {
  return {
    unit: {
      property_id: input.property_id,
      unit_number: input.unit_number,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      floor: input.floor ?? null,
      area_sqft: input.area_sqft ?? null,
      rent_cents: toCents(input.rent),
      status: input.status ?? 'vacant',
      notes: input.notes,
    },
  }
}
