import apiClient from './client'
import type { UnitsResponse, UnitResponse } from '@/types'
import { buildQueryString } from '@/lib/utils'

export const unitsApi = {
  list: (propertyId: string, params?: Record<string, unknown>) =>
    apiClient
      .get<UnitsResponse>(`/properties/${propertyId}/units${buildQueryString(params ?? {})}`)
      .then(r => r.data),

  get: (propertyId: string, unitId: string) =>
    apiClient.get<UnitResponse>(`/properties/${propertyId}/units/${unitId}`).then(r => r.data),

  create: (propertyId: string, attrs: Record<string, unknown>) =>
    apiClient
      .post<UnitResponse>(`/properties/${propertyId}/units`, {
        data: { type: 'units', attributes: attrs },
      })
      .then(r => r.data),

  update: (propertyId: string, unitId: string, attrs: Record<string, unknown>) =>
    apiClient
      .patch<UnitResponse>(`/properties/${propertyId}/units/${unitId}`, {
        data: { id: unitId, type: 'units', attributes: attrs },
      })
      .then(r => r.data),
}
