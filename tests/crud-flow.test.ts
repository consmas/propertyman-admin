import { describe, expect, it } from 'vitest'
import { toCreateUnitRequest, toCreateUserRequest } from '@/lib/api/flow'

describe('users and units CRUD payload flow', () => {
  it('builds user create payload', () => {
    const payload = toCreateUserRequest({
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'property_manager',
      status: 'active',
    })

    expect(payload).toEqual({
      user: {
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'property_manager',
        password: undefined,
        phone: undefined,
        status: 'active',
      },
    })
  })

  it('builds unit create payload with cents conversion', () => {
    const payload = toCreateUnitRequest({
      property_id: '9d7e222e-cd07-4299-84e4-df06b3576f0b',
      unit_number: 'A-101',
      bedrooms: 2,
      bathrooms: 1,
      rent: 12500.75,
      status: 'vacant',
    })

    expect(payload.unit.rent_cents).toBe(1250075)
    expect(payload.unit.unit_number).toBe('A-101')
  })
})
