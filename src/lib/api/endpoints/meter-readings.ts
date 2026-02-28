import apiClient from '../client'
import type {
  ApiMeterReading,
  ApiResponse,
  CreateMeterReadingRequest,
  ListMeterReadingsParams,
  UpdateMeterReadingRequest,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const meterReadingsEndpoints = {
  list: async (params?: ListMeterReadingsParams): Promise<ApiResponse<ApiMeterReading[]>> => {
    const res = await apiClient.get(`/meter_readings${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiMeterReading[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiMeterReading>> => {
    const res = await apiClient.get(`/meter_readings/${id}`)
    return unwrapApiResponse<ApiMeterReading>(res.data)
  },

  create: async (payload: CreateMeterReadingRequest): Promise<ApiResponse<ApiMeterReading>> => {
    const res = await apiClient.post('/meter_readings', payload)
    return unwrapApiResponse<ApiMeterReading>(res.data)
  },

  update: async (
    id: string,
    payload: UpdateMeterReadingRequest
  ): Promise<ApiResponse<ApiMeterReading>> => {
    const res = await apiClient.patch(`/meter_readings/${id}`, payload)
    return unwrapApiResponse<ApiMeterReading>(res.data)
  },
}
