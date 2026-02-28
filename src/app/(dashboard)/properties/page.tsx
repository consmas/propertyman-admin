'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Building2, Plus } from 'lucide-react'
import { propertiesApi } from '@/lib/api/properties'
import { parseList } from '@/lib/jsonapi'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { formatPercent } from '@/lib/utils'
import type { PropertyAttributes } from '@/types'

type PropertyRow = PropertyAttributes & { id: string }

const columns: Column<PropertyRow>[] = [
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
      <div>
        <span className="font-medium">{row.occupied_units}</span>
        <span className="text-gray-400">/{row.total_units} occupied</span>
      </div>
    ),
  },
  {
    key: 'occupancy',
    header: 'Occupancy',
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${(row.occupied_units / row.total_units) * 100}%` }}
          />
        </div>
        <span className="text-sm">{formatPercent((row.occupied_units / row.total_units) * 100)}</span>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} type="property" />,
  },
]

export default function PropertiesPage() {
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.list({ per_page: 50 }),
  })

  const { data: rows, meta } = data
    ? parseList<PropertyAttributes>(data as never)
    : { data: [], meta: {} }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description="Manage all your properties"
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={meta?.total ?? rows.length}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/dashboard/properties/${r.id}`)}
        searchable
        emptyMessage="No properties found. Add your first property to get started."
      />
    </div>
  )
}
