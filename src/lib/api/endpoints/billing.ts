import apiClient from '../client'
import type {
  ApiResponse,
  RunWaterBillingRequest,
  WaterBillingRunResult,
} from '@/types/api'
import { unwrapApiResponse } from './shared'

export const billingEndpoints = {
  runWaterInvoices: async (
    payload: RunWaterBillingRequest
  ): Promise<ApiResponse<WaterBillingRunResult>> => {
    const res = await apiClient.post('/billing/water_invoices', payload)
    return unwrapApiResponse<WaterBillingRunResult>(res.data)
  },
}
