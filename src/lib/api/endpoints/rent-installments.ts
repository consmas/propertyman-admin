import apiClient from '../client'
import type {
  ApiRentInstallment,
  ApiResponse,
  ListRentInstallmentsParams,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const rentInstallmentsEndpoints = {
  list: async (
    params?: ListRentInstallmentsParams
  ): Promise<ApiResponse<ApiRentInstallment[]>> => {
    const res = await apiClient.get(`/rent_installments${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiRentInstallment[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiRentInstallment>> => {
    const res = await apiClient.get(`/rent_installments/${id}`)
    return unwrapApiResponse<ApiRentInstallment>(res.data)
  },
}
