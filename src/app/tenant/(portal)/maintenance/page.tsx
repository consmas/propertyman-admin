'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useTenantProfile } from '@/hooks/use-tenant'
import { maintenanceEndpoints } from '@/lib/api/endpoints/maintenance'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
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

const STATUS_VARIANT: Record<string, 'success' | 'gray' | 'danger' | 'warning'> = {
  open: 'warning',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'gray',
  cancelled: 'gray',
}

const PRIORITY_VARIANT: Record<string, 'success' | 'gray' | 'danger' | 'warning'> = {
  low: 'gray',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger',
}

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

  if (loadingTenant) return <PageLoader />

  if (tenantError || !tenant) {
    return (
      <ErrorState
        title="Profile not found"
        message="Your tenant profile could not be loaded. Please contact your property manager."
      />
    )
  }

  const allRequests = maintenanceRes?.data ?? []
  const requests = tenantId
    ? allRequests.filter((r) => !r.tenant_id || r.tenant_id === tenantId)
    : allRequests

  const columns: Column<ApiMaintenanceRequest>[] = [
    { key: 'title', header: 'Title' },
    {
      key: 'priority',
      header: 'Priority',
      render: (r) => <Badge variant={PRIORITY_VARIANT[r.priority] ?? 'gray'}>{r.priority}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge variant={STATUS_VARIANT[r.status] ?? 'gray'}>{r.status}</Badge>,
    },
    { key: 'requested_at', header: 'Submitted', render: (r) => formatDate(r.requested_at) },
  ]

  return (
    <div className="fade-up space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as MaintenanceStatus | '')}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value || '_all'}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={(v) => setPriorityFilter(v as MaintenancePriority | '')}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value || '_all'}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Link href="/tenant/maintenance/new">
          <Button>
            <Plus className="h-4 w-4" />
            Submit Request
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        isLoading={loadingMaintenance}
        rowKey={(r) => r.id}
        onRowClick={(row) => router.push(`/tenant/maintenance/${row.id}`)}
        emptyMessage="No maintenance requests found."
      />
    </div>
  )
}
