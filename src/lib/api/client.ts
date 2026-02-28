import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import { ApiError } from '@/types'

// Base URL is the host only (e.g. https://propertyapi.rohodev.com); /api/v1 is appended here
const BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://propertyapi.rohodev.com') + '/api/v1'

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'pm_access_token',
  REFRESH_TOKEN: 'pm_refresh_token',
  USER: 'pm_user',
} as const

// Create the main axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30_000,
})

// ─── Request interceptor: inject auth token ──────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const url = config.url ?? ''
      const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/refresh')
      if (isAuthRequest) return config

      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor: handle 401 + refresh ──────────────────────────────
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function notifySubscribers(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    : null

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  // Refresh body uses root `auth` key per API contract
  const response = await axios.post(`${BASE_URL}/auth/refresh`, {
    auth: { refresh_token: refreshToken },
  })

  // JSON:API: { data: { type, attributes: { access_token, ... } } }
  const rawData = response.data?.data
  const payload = rawData?.attributes ?? rawData ?? response.data
  const newAccessToken: string = payload?.access_token

  if (!newAccessToken) throw new Error('Invalid refresh response')

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)
  try {
    const persisted = localStorage.getItem('auth-store')
    if (persisted) {
      const parsed = JSON.parse(persisted) as { state?: Record<string, unknown> }
      parsed.state = parsed.state ?? {}
      parsed.state.access_token = newAccessToken
      localStorage.setItem('auth-store', JSON.stringify(parsed))
    }
  } catch {
    // Ignore persist sync errors; localStorage token is still updated.
  }

  const newRefreshToken: string | undefined = payload?.refresh_token
  if (newRefreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
    try {
      const persisted = localStorage.getItem('auth-store')
      if (persisted) {
        const parsed = JSON.parse(persisted) as { state?: Record<string, unknown> }
        parsed.state = parsed.state ?? {}
        parsed.state.refresh_token = newRefreshToken
        localStorage.setItem('auth-store', JSON.stringify(parsed))
      }
    } catch {
      // Ignore persist sync errors; localStorage token is still updated.
    }
  }

  return newAccessToken
}

function forceLogout() {
  if (typeof window === 'undefined') return
  // Clear individual token keys
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  // Clear the Zustand persist store — without this, onRehydrateStorage re-activates
  // stale tokens on the next page load, causing an infinite redirect loop
  localStorage.removeItem('auth-store')
  // Clear the proxy auth cookie so the server-side guard also reflects logged-out state
  document.cookie = 'pm_auth=;path=/;max-age=0'
  window.location.href = '/login'
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    const reqUrl = originalRequest?.url ?? ''
    const isRefreshRequest = reqUrl.includes('/auth/refresh')

    if (error.response?.status === 401 && isRefreshRequest) {
      forceLogout()
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(apiClient(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()
        notifySubscribers(newToken)
        isRefreshing = false

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return apiClient(originalRequest)
      } catch {
        isRefreshing = false
        refreshSubscribers = []
        forceLogout()
        return Promise.reject(error)
      }
    }

    // Normalise error into ApiError
    const status = error.response?.status ?? 0
    const data = error.response?.data as { errors?: Array<{ title?: string; detail?: string }> }
    const errors = data?.errors ?? []

    // Prefer validation details and preserve multiple backend error details for the UI.
    const detailMessages = errors
      .map((item) => item.detail?.trim())
      .filter((item): item is string => Boolean(item))
    const combinedDetails = detailMessages.length > 0 ? detailMessages.join(' | ') : undefined

    const message =
      combinedDetails ??
      errors[0]?.title ??
      error.message ??
      'An error occurred'

    return Promise.reject(new ApiError(message, status, errors as never))
  }
)

export default apiClient
