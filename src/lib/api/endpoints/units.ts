import apiClient from '../client'
import axios from 'axios'
import type {
  ApiResponse,
  ApiUnit,
  CreateUnitRequest,
  ListUnitsParams,
  UpdateUnitRequest,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const unitsEndpoints = {
  list: async (params?: ListUnitsParams): Promise<ApiResponse<ApiUnit[]>> => {
    const res = await apiClient.get(`/units${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiUnit[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiUnit>> => {
    const res = await apiClient.get(`/units/${id}`)
    return unwrapApiResponse<ApiUnit>(res.data)
  },

  create: async (payload: CreateUnitRequest): Promise<ApiResponse<ApiUnit>> => {
    try {
      const res = await apiClient.post('/units', payload)
      return unwrapApiResponse<ApiUnit>(res.data)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404 && payload.unit.property_id) {
        const res = await apiClient.post(`/properties/${payload.unit.property_id}/units`, payload)
        return unwrapApiResponse<ApiUnit>(res.data)
      }
      throw error
    }
  },

  update: async (id: string, payload: UpdateUnitRequest): Promise<ApiResponse<ApiUnit>> => {
    const normalizeLegacyStatus = (status: string | undefined) => {
      if (status === 'available') return 'vacant'
      if (status === 'unavailable') return 'reserved'
      return status
    }

    try {
      const res = await apiClient.patch(`/units/${id}`, payload)
      return unwrapApiResponse<ApiUnit>(res.data)
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error

      // Some deployments expose nested routes for updates.
      if (error.response?.status === 404 && payload.unit?.property_id) {
        const res = await apiClient.patch(`/properties/${payload.unit.property_id}/units/${id}`, payload)
        return unwrapApiResponse<ApiUnit>(res.data)
      }

      // Legacy status enums may still be expected by some deployments.
      if (error.response?.status === 422 && payload.unit?.status) {
        const legacyStatus = normalizeLegacyStatus(payload.unit.status)
        if (legacyStatus !== payload.unit.status) {
          const res = await apiClient.patch(`/units/${id}`, {
            unit: {
              ...payload.unit,
              status: legacyStatus,
            },
          })
          return unwrapApiResponse<ApiUnit>(res.data)
        }
      }

      throw error
    }
  },
}
