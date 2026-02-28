import apiClient from './client'
import type { LeasesResponse, LeaseResponse, CreateLeasePayload, RentInstallment } from '@/types'
import { buildQueryString } from '@/lib/utils'

export const leasesApi = {
  list: (propertyId: string, params?: Record<string, unknown>) =>
    apiClient
      .get<LeasesResponse>(`/properties/${propertyId}/leases${buildQueryString(params ?? {})}`)
      .then(r => r.data),

  get: (propertyId: string, leaseId: string) =>
    apiClient
      .get<LeaseResponse>(`/properties/${propertyId}/leases/${leaseId}`)
      .then(r => r.data),

  create: (propertyId: string, payload: CreateLeasePayload) =>
    apiClient
      .post<LeaseResponse>(`/properties/${propertyId}/leases`, {
        data: { type: 'leases', attributes: payload },
      })
      .then(r => r.data),

  terminate: (propertyId: string, leaseId: string, reason?: string) =>
    apiClient
      .patch<LeaseResponse>(`/properties/${propertyId}/leases/${leaseId}/terminate`, {
        data: { id: leaseId, type: 'leases', attributes: { reason } },
      })
      .then(r => r.data),

  getInstallments: (propertyId: string, leaseId: string) =>
    apiClient
      .get<{ data: { attributes: { installments: RentInstallment[] } } }>(
        `/properties/${propertyId}/leases/${leaseId}/installments`
      )
      .then(r => r.data.data.attributes.installments),
}
