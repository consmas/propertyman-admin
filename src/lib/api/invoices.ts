import apiClient from './client'
import type { InvoicesResponse, InvoiceResponse, InvoiceFilters } from '@/types'
import { buildQueryString } from '@/lib/utils'

export const invoicesApi = {
  list: (propertyId: string, filters?: InvoiceFilters) =>
    apiClient
      .get<InvoicesResponse>(`/properties/${propertyId}/invoices${buildQueryString(filters ?? {})}`)
      .then(r => r.data),

  get: (propertyId: string, invoiceId: string) =>
    apiClient
      .get<InvoiceResponse>(`/properties/${propertyId}/invoices/${invoiceId}`)
      .then(r => r.data),

  void: (propertyId: string, invoiceId: string) =>
    apiClient
      .patch<InvoiceResponse>(`/properties/${propertyId}/invoices/${invoiceId}/void`, {})
      .then(r => r.data),

  runWaterBilling: (propertyId: string, billing_period: string) =>
    apiClient
      .post(`/properties/${propertyId}/invoices/water_billing_run`, {
        data: { type: 'water_billing_runs', attributes: { billing_period } },
      })
      .then(r => r.data),
}
