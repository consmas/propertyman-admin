import apiClient from '../client'
import type {
  ApiPumpTopup,
  ApiResponse,
  CreatePumpTopupRequest,
  ListPumpTopupsParams,
  UpdatePumpTopupRequest,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const pumpTopupsEndpoints = {
  list: async (params?: ListPumpTopupsParams): Promise<ApiResponse<ApiPumpTopup[]>> => {
    const res = await apiClient.get(`/pump_topups${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiPumpTopup[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiPumpTopup>> => {
    const res = await apiClient.get(`/pump_topups/${id}`)
    return unwrapApiResponse<ApiPumpTopup>(res.data)
  },

  create: async (payload: CreatePumpTopupRequest): Promise<ApiResponse<ApiPumpTopup>> => {
    const res = await apiClient.post('/pump_topups', payload)
    return unwrapApiResponse<ApiPumpTopup>(res.data)
  },

  update: async (id: string, payload: UpdatePumpTopupRequest): Promise<ApiResponse<ApiPumpTopup>> => {
    const res = await apiClient.patch(`/pump_topups/${id}`, payload)
    return unwrapApiResponse<ApiPumpTopup>(res.data)
  },
}
