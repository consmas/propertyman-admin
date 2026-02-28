'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { leasesApi } from '@/lib/api/leases'
import { parseList } from '@/lib/jsonapi'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { LeaseAttributes } from '@/types'

type LeaseRow = LeaseAttributes & { id: string }

const columns: Column<LeaseRow>[] = [
  {
    key: 'unit_id',
    header: 'Unit',
    render: (row) => <span className="font-medium">Unit {row.unit_id.slice(0, 8)}</span>,
  },
  {
    key: 'tenant_id',
    header: 'Tenant',
    render: (row) => <span className="text-gray-600">{row.tenant_id.slice(0, 8)}…</span>,
  },
  {
    key: 'start_date',
    header: 'Period',
    render: (row) => (
      <div>
        <p className="text-sm">{formatDate(row.start_date)} → {formatDate(row.end_date)}</p>
        <p className="text-xs text-gray-500">{row.duration_months} months</p>
      </div>
    ),
  },
  {
    key: 'monthly_rent',
    header: 'Monthly Rent',
    render: (row) => <span className="font-medium">{formatCurrency(row.monthly_rent)}</span>,
  },
  {
    key: 'paid_through_date',
    header: 'Paid Through',
    render: (row) => (
      <span className={row.paid_through_date ? 'text-gray-900' : 'text-gray-400'}>
        {formatDate(row.paid_through_date)}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} type="lease" />,
  },
]

export default function LeasesPage() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()

  const { data, isLoading } = useQuery({
    queryKey: ['leases', propertyId],
    queryFn: () => leasesApi.list(propertyId!, { per_page: 50 }),
    enabled: !!propertyId,
  })

  const { data: rows, meta } = data
    ? parseList<LeaseAttributes>(data as never)
    : { data: [], meta: {} }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leases"
        description="Manage all lease agreements"
        actions={
          <Link href="/dashboard/leases/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Lease
            </Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={meta?.total ?? rows.length}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/dashboard/leases/${r.id}`)}
        searchable
        searchPlaceholder="Search leases…"
        emptyMessage="No leases found. Create a new lease to get started."
      />
    </div>
  )
}
