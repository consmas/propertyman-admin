import apiClient from './client'
import type { TenantsResponse, TenantResponse } from '@/types'
import { buildQueryString } from '@/lib/utils'

export const tenantsApi = {
  list: (propertyId: string, params?: Record<string, unknown>) =>
    apiClient
      .get<TenantsResponse>(`/properties/${propertyId}/tenants${buildQueryString(params ?? {})}`)
      .then(r => r.data),

  get: (propertyId: string, tenantId: string) =>
    apiClient
      .get<TenantResponse>(`/properties/${propertyId}/tenants/${tenantId}`)
      .then(r => r.data),

  create: (propertyId: string, attrs: Record<string, unknown>) =>
    apiClient
      .post<TenantResponse>(`/properties/${propertyId}/tenants`, {
        data: { type: 'tenants', attributes: attrs },
      })
      .then(r => r.data),

  update: (propertyId: string, tenantId: string, attrs: Record<string, unknown>) =>
    apiClient
      .patch<TenantResponse>(`/properties/${propertyId}/tenants/${tenantId}`, {
        data: { id: tenantId, type: 'tenants', attributes: attrs },
      })
      .then(r => r.data),
}
