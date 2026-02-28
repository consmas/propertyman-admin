import apiClient from './client'
import type { AuthTokens, AuthUser, LoginCredentials } from '@/types'

interface LoginResponse {
  data: {
    attributes: AuthTokens & { user: AuthUser }
  }
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: AuthUser }> => {
    const res = await apiClient.post<LoginResponse>('/auth/login', {
      data: { type: 'sessions', attributes: credentials },
    })
    const attrs = res.data.data.attributes
    return {
      tokens: {
        access_token: attrs.access_token,
        refresh_token: attrs.refresh_token,
        expires_in: attrs.expires_in,
        token_type: attrs.token_type,
      },
      user: attrs.user,
    }
  },

  logout: async (): Promise<void> => {
    await apiClient.delete('/auth/logout').catch(() => {
      // Always succeed locally even if server call fails
    })
  },

  getMe: async (): Promise<AuthUser> => {
    const res = await apiClient.get('/auth/me')
    return res.data.data.attributes as AuthUser
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const res = await apiClient.post('/auth/refresh', {
      data: { type: 'tokens', attributes: { refresh_token: refreshToken } },
    })
    return res.data.data.attributes as AuthTokens
  },
}
