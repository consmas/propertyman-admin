import apiClient from '../client'
import type {
  ApiMaintenanceRequest,
  CreateMaintenanceRequest,
  UpdateMaintenanceRequest,
  MaintenanceStatus,
  ListMaintenanceRequestsParams,
  ApiResponse,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const maintenanceEndpoints = {
  list: async (
    params?: ListMaintenanceRequestsParams
  ): Promise<ApiResponse<ApiMaintenanceRequest[]>> => {
    const res = await apiClient.get(`/maintenance_requests${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiMaintenanceRequest[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiMaintenanceRequest>> => {
    const res = await apiClient.get(`/maintenance_requests/${id}`)
    return unwrapApiResponse<ApiMaintenanceRequest>(res.data)
  },

  create: async (
    payload: CreateMaintenanceRequest
  ): Promise<ApiResponse<ApiMaintenanceRequest>> => {
    const res = await apiClient.post('/maintenance_requests', payload)
    return unwrapApiResponse<ApiMaintenanceRequest>(res.data)
  },

  update: async (
    id: string,
    payload: UpdateMaintenanceRequest
  ): Promise<ApiResponse<ApiMaintenanceRequest>> => {
    const res = await apiClient.patch(`/maintenance_requests/${id}`, payload)
    return unwrapApiResponse<ApiMaintenanceRequest>(res.data)
  },

  updateStatus: async (
    id: string,
    status: MaintenanceStatus,
    notes?: string
  ): Promise<ApiResponse<ApiMaintenanceRequest>> => {
    return maintenanceEndpoints.update(id, { maintenance_request: { status, notes } })
  },
}
