import { describe, expect, it } from 'vitest'
import { canAccessPath } from '@/lib/rbac'

describe('auth guard route access', () => {
  it('allows owner on users pages', () => {
    expect(canAccessPath('/app/users', 'owner')).toBe(true)
  })

  it('blocks tenant from users pages', () => {
    expect(canAccessPath('/app/users', 'tenant')).toBe(false)
  })

  it('allows caretaker on maintenance pages', () => {
    expect(canAccessPath('/app/maintenance', 'caretaker')).toBe(true)
  })
})
