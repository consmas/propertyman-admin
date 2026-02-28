import apiClient from '../client'
import type {
  ApiResponse,
  ApiUser,
  CreateUserRequest,
  ListUsersParams,
  UpdateUserRequest,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const usersEndpoints = {
  list: async (params?: ListUsersParams): Promise<ApiResponse<ApiUser[]>> => {
    const res = await apiClient.get(`/users${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiUser[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiUser>> => {
    const res = await apiClient.get(`/users/${id}`)
    return unwrapApiResponse<ApiUser>(res.data)
  },

  create: async (payload: CreateUserRequest): Promise<ApiResponse<ApiUser>> => {
    const res = await apiClient.post('/users', payload)
    return unwrapApiResponse<ApiUser>(res.data)
  },

  update: async (id: string, payload: UpdateUserRequest): Promise<ApiResponse<ApiUser>> => {
    const res = await apiClient.patch(`/users/${id}`, payload)
    return unwrapApiResponse<ApiUser>(res.data)
  },
}
