import apiClient from './client'
import type { PropertiesResponse, PropertyResponse, DashboardData } from '@/types'
import { buildQueryString } from '@/lib/utils'

export const propertiesApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PropertiesResponse>(`/properties${buildQueryString(params ?? {})}`).then(r => r.data),

  get: (id: string) =>
    apiClient.get<PropertyResponse>(`/properties/${id}`).then(r => r.data),

  getDashboard: (propertyId: string) =>
    apiClient.get<{ data: { attributes: DashboardData } }>(`/properties/${propertyId}/dashboard`).then(r => r.data.data.attributes),

  create: (attrs: Record<string, unknown>) =>
    apiClient.post<PropertyResponse>('/properties', { data: { type: 'properties', attributes: attrs } }).then(r => r.data),

  update: (id: string, attrs: Record<string, unknown>) =>
    apiClient.patch<PropertyResponse>(`/properties/${id}`, { data: { id, type: 'properties', attributes: attrs } }).then(r => r.data),
}
