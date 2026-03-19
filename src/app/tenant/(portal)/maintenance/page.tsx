'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useTenantProfile } from '@/hooks/use-tenant'
import { maintenanceEndpoints } from '@/lib/api/endpoints/maintenance'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { formatDate, humanizeStatus } from '@/lib/utils'
import type { ApiMaintenanceRequest, MaintenanceStatus, MaintenancePriority } from '@/types/api'

const STATUS_OPTIONS: { value: MaintenanceStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PRIORITY_OPTIONS: { value: MaintenancePriority | ''; label: string }[] = [
  { value: '', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export default function TenantMaintenancePage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<MaintenancePriority | ''>('')
  const { data: tenant, isLoading: loadingTenant, isError: tenantError } = useTenantProfile()

  const tenantId = tenant?.id
  const propertyId = tenant?.property_id

  const { data: maintenanceRes, isLoading: loadingMaintenance } = useQuery({
    queryKey: ['tenant-maintenance-list', propertyId, statusFilter, priorityFilter],
    queryFn: () =>
      maintenanceEndpoints.list({
        property_id: propertyId!,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(priorityFilter ? { priority: priorityFilter } : {}),
      }),
    enabled: Boolean(propertyId),
  })

  if (loadingTenant) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
        Loading profile…
      </div>
    )
  }

  if (tenantError || !tenant) {
    return (
      <ErrorState
        title="Profile not found"
        message="Your tenant profile could not be loaded. Please contact your property manager."
      />
    )
  }

  const allRequests = maintenanceRes?.data ?? []
  // Show requests associated with this tenant or all property requests
  const requests = tenantId
    ? allRequests.filter(r => !r.tenant_id || r.tenant_id === tenantId)
    : allRequests

  const columns: Column<ApiMaintenanceRequest>[] = [
    { key: 'title', header: 'Title' },
    { key: 'priority', header: 'Priority', render: r => humanizeStatus(r.priority) },
    { key: 'status', header: 'Status', render: r => humanizeStatus(r.status) },
    { key: 'requested_at', header: 'Submitted', render: r => formatDate(r.requested_at) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Requests"
        description="Track and submit maintenance requests"
        actions={
          <Link href="/tenant/maintenance/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4" />
              Submit Request
            </Button>
          </Link>
        }
      />

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as MaintenanceStatus | '')}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value as MaintenancePriority | '')}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {PRIORITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        isLoading={loadingMaintenance}
        rowKey={r => r.id}
        onRowClick={row => router.push(`/tenant/maintenance/${row.id}`)}
        emptyMessage="No maintenance requests found."
      />
    </div>
  )
}
