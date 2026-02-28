import apiClient from '../client'
import type {
  ApiAuditLog,
  ApiResponse,
  ListAuditLogsParams,
} from '@/types/api'
import { buildQueryString } from '@/lib/utils'
import { unwrapApiResponse } from './shared'

export const auditLogsEndpoints = {
  list: async (params?: ListAuditLogsParams): Promise<ApiResponse<ApiAuditLog[]>> => {
    const res = await apiClient.get(`/audit_logs${buildQueryString(params ?? {})}`)
    return unwrapApiResponse<ApiAuditLog[]>(res.data)
  },

  get: async (id: string): Promise<ApiResponse<ApiAuditLog>> => {
    const res = await apiClient.get(`/audit_logs/${id}`)
    return unwrapApiResponse<ApiAuditLog>(res.data)
  },
}
