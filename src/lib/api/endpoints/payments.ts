import apiClient from '../client'
import type {
  ApiPayment,
  CreatePaymentRequest,
  ListPaymentsParams,
  ApiResponse,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const paymentsEndpoints = {
  list: async (params?: ListPaymentsParams): Promise<ApiResponse<ApiPayment[]>> => {
    const res = await apiClient.get(`/payments${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiPayment[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiPayment>> => {
    const res = await apiClient.get(`/payments/${id}`)
    return unwrapApiResponse<ApiPayment>(res.data)
  },

  create: async (payload: CreatePaymentRequest): Promise<ApiResponse<ApiPayment>> => {
    const res = await apiClient.post('/payments', payload)
    return unwrapApiResponse<ApiPayment>(res.data)
  },
}
