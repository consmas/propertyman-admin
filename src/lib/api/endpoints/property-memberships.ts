import apiClient from '../client'
import type {
  ApiPropertyMembership,
  ApiResponse,
  CreatePropertyMembershipRequest,
  ListPropertyMembershipsParams,
  UpdatePropertyMembershipRequest,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const propertyMembershipsEndpoints = {
  list: async (
    params?: ListPropertyMembershipsParams
  ): Promise<ApiResponse<ApiPropertyMembership[]>> => {
    const res = await apiClient.get(`/property_memberships${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiPropertyMembership[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiPropertyMembership>> => {
    const res = await apiClient.get(`/property_memberships/${id}`)
    return unwrapApiResponse<ApiPropertyMembership>(res.data)
  },

  create: async (
    payload: CreatePropertyMembershipRequest
  ): Promise<ApiResponse<ApiPropertyMembership>> => {
    const res = await apiClient.post('/property_memberships', payload)
    return unwrapApiResponse<ApiPropertyMembership>(res.data)
  },

  update: async (
    id: string,
    payload: UpdatePropertyMembershipRequest
  ): Promise<ApiResponse<ApiPropertyMembership>> => {
    const res = await apiClient.patch(`/property_memberships/${id}`, payload)
    return unwrapApiResponse<ApiPropertyMembership>(res.data)
  },
}
