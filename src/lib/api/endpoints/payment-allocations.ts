import apiClient from '../client'
import type {
  ApiPaymentAllocation,
  ApiResponse,
  ListPaymentAllocationsParams,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const paymentAllocationsEndpoints = {
  list: async (
    params?: ListPaymentAllocationsParams
  ): Promise<ApiResponse<ApiPaymentAllocation[]>> => {
    const res = await apiClient.get(`/payment_allocations${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiPaymentAllocation[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiPaymentAllocation>> => {
    const res = await apiClient.get(`/payment_allocations/${id}`)
    return unwrapApiResponse<ApiPaymentAllocation>(res.data)
  },
}
