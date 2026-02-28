import apiClient from '../client'
import axios from 'axios'
import type {
  ApiProperty,
  ApiResponse,
  CreatePropertyRequest,
  ListPropertiesParams,
  UpdatePropertyRequest,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const propertiesEndpoints = {
  list: async (params?: ListPropertiesParams): Promise<ApiResponse<ApiProperty[]>> => {
    const res = await apiClient.get(`/properties${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiProperty[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiProperty>> => {
    const res = await apiClient.get(`/properties/${id}`)
    return unwrapApiResponse<ApiProperty>(res.data)
  },

  create: async (payload: CreatePropertyRequest): Promise<ApiResponse<ApiProperty>> => {
    try {
      const res = await apiClient.post('/properties', payload)
      return unwrapApiResponse<ApiProperty>(res.data)
    } catch (error) {
      // Compatibility fallback: some deployments still expect JSON:API payload shape.
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        const res = await apiClient.post('/properties', {
          data: { type: 'properties', attributes: payload.property },
        })
        return unwrapApiResponse<ApiProperty>(res.data)
      }
      throw error
    }
  },

  update: async (id: string, payload: UpdatePropertyRequest): Promise<ApiResponse<ApiProperty>> => {
    try {
      const res = await apiClient.patch(`/properties/${id}`, payload)
      return unwrapApiResponse<ApiProperty>(res.data)
    } catch (error) {
      // Compatibility fallback: support JSON:API patch format.
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        const res = await apiClient.patch(`/properties/${id}`, {
          data: { id, type: 'properties', attributes: payload.property ?? {} },
        })
        return unwrapApiResponse<ApiProperty>(res.data)
      }
      throw error
    }
  },
}
