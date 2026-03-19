import apiClient from '../client'
import type { ApiOnlinePayment, CreateOnlinePaymentRequest, ApiResponse } from '@/types/api'
import { unwrapApiResponse } from './shared'

export const onlinePaymentsEndpoints = {
  create: async (payload: CreateOnlinePaymentRequest): Promise<ApiResponse<ApiOnlinePayment>> => {
    const res = await apiClient.post('/online_payments', payload)
    return unwrapApiResponse<ApiOnlinePayment>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiOnlinePayment>> => {
    const res = await apiClient.get(`/online_payments/${id}`)
    return unwrapApiResponse<ApiOnlinePayment>(res.data)
  },
}
