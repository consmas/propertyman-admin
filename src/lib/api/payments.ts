import apiClient from './client'
import type { PaymentsResponse, PaymentResponse, RecordPaymentPayload } from '@/types'
import { buildQueryString } from '@/lib/utils'

export const paymentsApi = {
  list: (propertyId: string, params?: Record<string, unknown>) =>
    apiClient
      .get<PaymentsResponse>(`/properties/${propertyId}/payments${buildQueryString(params ?? {})}`)
      .then(r => r.data),

  get: (propertyId: string, paymentId: string) =>
    apiClient
      .get<PaymentResponse>(`/properties/${propertyId}/payments/${paymentId}`)
      .then(r => r.data),

  create: (propertyId: string, payload: RecordPaymentPayload) =>
    apiClient
      .post<PaymentResponse>(`/properties/${propertyId}/payments`, {
        data: { type: 'payments', attributes: payload },
      })
      .then(r => r.data),
}
