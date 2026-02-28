'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { maintenanceEndpoints } from '@/lib/api/endpoints/maintenance'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { ApiMaintenanceRequest, MaintenanceStatus } from '@/types/api'

const STATUS_TABS: { value: MaintenanceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

function agingLabel(requestedAt: string): string {
  try {
    return formatDistanceToNow(parseISO(requestedAt), { addSuffix: true })
  } catch {
    return '—'
  }
}

const columns: Column<ApiMaintenanceRequest>[] = [
  {
    key: 'title',
    header: 'Issue',
    render: (row) => (
      <div>
        <p className="font-medium text-gray-900 line-clamp-1">{row.title}</p>
        <p className="text-xs text-gray-500 line-clamp-1">{row.description}</p>
      </div>
    ),
  },
  {
    key: 'unit_id',
    header: 'Unit',
    render: (row) => (
      <span className="font-mono text-xs text-gray-500">{row.unit_id.slice(0, 8)}…</span>
    ),
  },
  {
    key: 'priority',
    header: 'Priority',
    render: (row) => <StatusBadge status={row.priority} type="maintenance_priority" />,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} type="maintenance" />,
  },
  {
    key: 'requested_at',
    header: 'Requested',
    render: (row) => (
      <div>
        <p className="text-sm">{formatDate(row.requested_at)}</p>
        <p className="text-xs text-gray-400">{agingLabel(row.requested_at)}</p>
      </div>
    ),
  },
  {
    key: 'resolved_at',
    header: 'Resolved',
    render: (row) => (
      <span className={row.resolved_at ? 'text-gray-700' : 'text-gray-400'}>
        {formatDate(row.resolved_at)}
      </span>
    ),
  },
]

export default function AppMaintenancePage() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const [page, setPage] = useState(1)
  const [activeStatus, setActiveStatus] = useState<MaintenanceStatus | 'all'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['app-maintenance', propertyId, activeStatus, page],
    queryFn: () =>
      maintenanceEndpoints.list({
        property_id: propertyId ?? undefined,
        status: activeStatus === 'all' ? undefined : activeStatus,
        page,
        per_page: 25,
      }),
    enabled: !!propertyId,
  })

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        description="Track and manage maintenance requests"
        actions={
          <Link href="/app/maintenance/new">
            <Button><Plus className="h-4 w-4" />New Request</Button>
          </Link>
        }
      />

      {/* Status tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setActiveStatus(tab.value); setPage(1) }}
            className={
              activeStatus === tab.value
                ? 'border-b-2 border-indigo-600 px-3 pb-2 pt-1 text-sm font-medium text-indigo-600'
                : 'px-3 pb-2 pt-1 text-sm text-gray-500 hover:text-gray-700'
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={data?.meta?.total ?? rows.length}
        page={page}
        perPage={25}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/app/maintenance/${r.id}`)}
        emptyMessage="No maintenance requests found."
      />
    </div>
  )
}
