import apiClient from '../client'
import type {
  ApiLease,
  CreateLeaseRequest,
  ListLeasesParams,
  UpdateLeaseRequest,
  ApiResponse,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const leasesEndpoints = {
  list: async (params?: ListLeasesParams): Promise<ApiResponse<ApiLease[]>> => {
    const res = await apiClient.get(`/leases${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiLease[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiLease>> => {
    const res = await apiClient.get(`/leases/${id}`)
    return unwrapApiResponse<ApiLease>(res.data)
  },

  create: async (payload: CreateLeaseRequest): Promise<ApiResponse<ApiLease>> => {
    const res = await apiClient.post('/leases', payload)
    return unwrapApiResponse<ApiLease>(res.data)
  },

  update: async (id: string, payload: UpdateLeaseRequest): Promise<ApiResponse<ApiLease>> => {
    const res = await apiClient.patch(`/leases/${id}`, payload)
    return unwrapApiResponse<ApiLease>(res.data)
  },

  terminate: async (id: string, reason?: string): Promise<ApiResponse<ApiLease>> => {
    const res = await apiClient.patch(
      `/leases/${id}/terminate`,
      { lease: { termination_reason: reason } }
    )
    return unwrapApiResponse<ApiLease>(res.data)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/leases/${id}`)
  },
}
