import apiClient from './client'
import type { MaintenanceListResponse, MaintenanceResponse, CreateMaintenancePayload, MaintenanceStatus } from '@/types'
import { buildQueryString } from '@/lib/utils'

export const maintenanceApi = {
  list: (propertyId: string, params?: Record<string, unknown>) =>
    apiClient
      .get<MaintenanceListResponse>(`/properties/${propertyId}/maintenance_requests${buildQueryString(params ?? {})}`)
      .then(r => r.data),

  get: (propertyId: string, requestId: string) =>
    apiClient
      .get<MaintenanceResponse>(`/properties/${propertyId}/maintenance_requests/${requestId}`)
      .then(r => r.data),

  create: (propertyId: string, payload: CreateMaintenancePayload) =>
    apiClient
      .post<MaintenanceResponse>(`/properties/${propertyId}/maintenance_requests`, {
        data: { type: 'maintenance_requests', attributes: payload },
      })
      .then(r => r.data),

  updateStatus: (propertyId: string, requestId: string, status: MaintenanceStatus, notes?: string) =>
    apiClient
      .patch<MaintenanceResponse>(`/properties/${propertyId}/maintenance_requests/${requestId}`, {
        data: { id: requestId, type: 'maintenance_requests', attributes: { status, notes } },
      })
      .then(r => r.data),
}
