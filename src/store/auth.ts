import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/api/client'
import { authEndpoints } from '@/lib/api/endpoints/auth'
import type { ApiAuthUser } from '@/types/api'

function setAuthCookie(user: ApiAuthUser | null) {
  if (typeof document === 'undefined' || !user) return
  document.cookie = `pm_auth=${encodeURIComponent(
    JSON.stringify({ authenticated: true, role: user.role })
  )};path=/;max-age=86400;SameSite=Lax`
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return
  document.cookie = 'pm_auth=;path=/;max-age=0'
}

interface AuthStore {
  user: ApiAuthUser | null
  access_token: string | null
  refresh_token: string | null
  access_expires_at: string | null
  is_authenticated: boolean
  is_loading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: ApiAuthUser) => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      access_expires_at: null,
      is_authenticated: false,
      is_loading: false,
      error: null,

      login: async (email, password) => {
        set({ is_loading: true, error: null })
        try {
          const data = await authEndpoints.login(email, password)

          // Sync tokens to localStorage for the axios interceptor
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token)
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token)
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))

          // Set middleware-readable cookie (role for RBAC checks)
          setAuthCookie(data.user)

          set({
            user: data.user,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            access_expires_at: data.access_expires_at,
            is_authenticated: true,
            is_loading: false,
          })
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Login failed'
          set({ error: message, is_loading: false })
          throw err
        }
      },

      logout: async () => {
        set({ is_loading: true })
        try {
          await authEndpoints.logout()
        } finally {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.USER)
          clearAuthCookie()
          set({
            user: null,
            access_token: null,
            refresh_token: null,
            access_expires_at: null,
            is_authenticated: false,
            is_loading: false,
          })
        }
      },

      setUser: (user) => {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
        set({ user })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        access_expires_at: state.access_expires_at,
        is_authenticated: state.is_authenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Re-sync tokens to localStorage so axios interceptor can pick them up
        if (state?.access_token && !localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, state.access_token)
        }
        if (state?.refresh_token && !localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, state.refresh_token)
        }

        // Keep middleware auth cookie aligned with persisted auth state.
        if (state?.is_authenticated && state.user) {
          setAuthCookie(state.user)
        } else {
          clearAuthCookie()
        }
      },
    }
  )
)
