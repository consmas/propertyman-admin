import apiClient from '../client'
import type {
  ApiResponse,
  ApiTenant,
  CreateTenantRequest,
  ListTenantsParams,
  UpdateTenantRequest,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const tenantsEndpoints = {
  list: async (params?: ListTenantsParams): Promise<ApiResponse<ApiTenant[]>> => {
    const res = await apiClient.get(`/tenants${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiTenant[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiTenant>> => {
    const res = await apiClient.get(`/tenants/${id}`)
    return unwrapApiResponse<ApiTenant>(res.data)
  },

  create: async (payload: CreateTenantRequest): Promise<ApiResponse<ApiTenant>> => {
    const res = await apiClient.post('/tenants', payload)
    return unwrapApiResponse<ApiTenant>(res.data)
  },

  update: async (id: string, payload: UpdateTenantRequest): Promise<ApiResponse<ApiTenant>> => {
    const res = await apiClient.patch(`/tenants/${id}`, payload)
    return unwrapApiResponse<ApiTenant>(res.data)
  },
}
