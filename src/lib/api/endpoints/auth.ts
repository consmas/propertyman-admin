import apiClient, { STORAGE_KEYS } from '../client'
import type {
  LoginRequest,
  LoginResponseData,
  RefreshRequest,
  LogoutRequest,
} from '@/types/api'

/** Extract attributes from JSON:API auth_session resource */
function extractAuthAttributes(resData: unknown): LoginResponseData {
  const d = resData as Record<string, unknown>
  // { data: { type: "auth_session", attributes: { access_token, ... } } }
  const inner = d?.data as Record<string, unknown> | undefined
  return (inner?.attributes ?? inner ?? d) as LoginResponseData
}

export const authEndpoints = {
  /**
   * POST /api/v1/auth/login
   * Body: { auth: { email, password } }
   */
  login: async (email: string, password: string): Promise<LoginResponseData> => {
    const body: LoginRequest = { auth: { email, password } }
    const res = await apiClient.post('/auth/login', body)
    return extractAuthAttributes(res.data)
  },

  /**
   * POST /api/v1/auth/refresh
   * Body: { auth: { refresh_token } }
   */
  refresh: async (refreshToken: string): Promise<LoginResponseData> => {
    const body: RefreshRequest = { auth: { refresh_token: refreshToken } }
    const res = await apiClient.post('/auth/refresh', body)
    return extractAuthAttributes(res.data)
  },

  /**
   * DELETE /api/v1/auth/logout
   * Body: { auth: { refresh_token } }
   */
  logout: async (): Promise<void> => {
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      : null

    const body: LogoutRequest = { auth: { refresh_token: refreshToken ?? '' } }
    await apiClient.delete('/auth/logout', { data: body }).catch(() => {
      // Always succeed locally — server-side invalidation is best-effort
    })
  },
}
