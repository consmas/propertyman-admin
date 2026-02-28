'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Building2, Plus } from 'lucide-react'
import { propertiesEndpoints } from '@/lib/api/endpoints/properties'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatPercent } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useHasRole } from '@/hooks/use-auth'
import type { ApiProperty } from '@/types/api'

const columns: Column<ApiProperty>[] = [
  {
    key: 'name',
    header: 'Property',
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
          <Building2 className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">{row.address}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'city',
    header: 'Location',
    render: (row) => `${row.city}, ${row.state}`,
  },
  {
    key: 'total_units',
    header: 'Units',
    render: (row) => (
      <span>
        <span className="font-medium">{row.occupied_units}</span>
        <span className="text-gray-400">/{row.total_units} occupied</span>
      </span>
    ),
  },
  {
    key: 'occupancy',
    header: 'Occupancy',
    render: (row) => {
      const rate = row.total_units > 0 ? (row.occupied_units / row.total_units) * 100 : 0
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${rate}%` }} />
          </div>
          <span className="text-sm">{formatPercent(rate)}</span>
        </div>
      )
    },
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} type="property" />,
  },
]

export default function AppPropertiesPage() {
  const router = useRouter()
  const canCreate = useHasRole('owner', 'admin')

  const { data, isLoading } = useQuery({
    queryKey: ['app-properties'],
    queryFn: () => propertiesEndpoints.list({ per_page: 50 }),
  })

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description="All properties scoped to your account"
        actions={
          canCreate ? (
            <Link href="/app/properties/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Property
              </Button>
            </Link>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={data?.meta?.total ?? rows.length}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/app/properties/${r.id}`)}
        searchable
        emptyMessage="No properties found."
      />
    </div>
  )
}
