'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import type { UserRole } from '@/types/api'

type PersistApi = {
  hasHydrated: () => boolean
  onHydrate: (listener: () => void) => () => void
  onFinishHydration: (listener: () => void) => () => void
}

function getPersistApi(): PersistApi | null {
  const store = useAuthStore as typeof useAuthStore & { persist?: PersistApi }
  return store.persist ?? null
}

export function useAuthHydrated(): boolean {
  const persist = getPersistApi()
  const [hydrated, setHydrated] = useState<boolean>(() => persist?.hasHydrated() ?? true)

  useEffect(() => {
    if (!persist) return
    const unsubHydrate = persist.onHydrate(() => setHydrated(false))
    const unsubFinish = persist.onFinishHydration(() => setHydrated(true))
    return () => {
      unsubHydrate()
      unsubFinish()
    }
  }, [persist])

  return hydrated
}

export function useAuth() {
  const store = useAuthStore()
  const hydrated = useAuthHydrated()

  return {
    user: store.user,
    isAuthenticated: store.is_authenticated,
    isLoading: store.is_loading,
    isHydrated: hydrated,
    error: store.error,
    login: store.login,
    logout: store.logout,
    clearError: store.clearError,
  }
}

export function useRole(): UserRole | null {
  return useAuthStore(s => s.user?.role ?? null)
}

export function useHasRole(...roles: UserRole[]): boolean {
  const role = useRole()
  if (!role) return false
  return roles.includes(role)
}

export function useCanAccess(requiredRoles: UserRole[]): boolean {
  return useHasRole(...requiredRoles)
}

export function useCanManageUsersMemberships(): boolean {
  return useHasRole('owner', 'admin')
}
