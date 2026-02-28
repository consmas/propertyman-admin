import apiClient from '../client'
import type {
  ApiInvoice,
  ApiResponse,
  CreateInvoiceRequest,
  ListInvoicesParams,
  UpdateInvoiceRequest,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const invoicesEndpoints = {
  list: async (params?: ListInvoicesParams): Promise<ApiResponse<ApiInvoice[]>> => {
    const res = await apiClient.get(`/invoices${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiInvoice[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiInvoice>> => {
    const res = await apiClient.get(`/invoices/${id}`)
    return unwrapApiResponse<ApiInvoice>(res.data)
  },

  create: async (payload: CreateInvoiceRequest): Promise<ApiResponse<ApiInvoice>> => {
    const res = await apiClient.post('/invoices', payload)
    return unwrapApiResponse<ApiInvoice>(res.data)
  },

  update: async (id: string, payload: UpdateInvoiceRequest): Promise<ApiResponse<ApiInvoice>> => {
    const res = await apiClient.patch(`/invoices/${id}`, payload)
    return unwrapApiResponse<ApiInvoice>(res.data)
  },
}
