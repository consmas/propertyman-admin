import apiClient from '../client'
import type {
  ApiInvoiceItem,
  ApiResponse,
  CreateInvoiceItemRequest,
  UpdateInvoiceItemRequest,
} from '@/types/api'
import { unwrapApiResponse } from './shared'

export const invoiceItemsEndpoints = {
  create: async (
    invoiceId: string,
    payload: CreateInvoiceItemRequest
  ): Promise<ApiResponse<ApiInvoiceItem>> => {
    const res = await apiClient.post(`/invoices/${invoiceId}/invoice_items`, payload)
    return unwrapApiResponse<ApiInvoiceItem>(res.data)
  },

  update: async (id: string, payload: UpdateInvoiceItemRequest): Promise<ApiResponse<ApiInvoiceItem>> => {
    const res = await apiClient.patch(`/invoice_items/${id}`, payload)
    return unwrapApiResponse<ApiInvoiceItem>(res.data)
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/invoice_items/${id}`)
  },
}
