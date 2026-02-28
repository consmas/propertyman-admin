'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Home, Plus } from 'lucide-react'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { unitsApi } from '@/lib/api/units'
import { parseList } from '@/lib/jsonapi'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { UnitAttributes } from '@/types'

type UnitRow = UnitAttributes & { id: string }

const columns: Column<UnitRow>[] = [
  {
    key: 'unit_number',
    header: 'Unit',
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100">
          <Home className="h-3.5 w-3.5 text-gray-600" />
        </div>
        <span className="font-medium">{row.unit_number}</span>
      </div>
    ),
  },
  {
    key: 'floor',
    header: 'Floor',
    render: (row) => row.floor != null ? `Floor ${row.floor}` : '—',
  },
  {
    key: 'bedrooms',
    header: 'Beds/Baths',
    render: (row) => `${row.bedrooms} bd / ${row.bathrooms} ba`,
  },
  {
    key: 'monthly_rent',
    header: 'Monthly Rent',
    render: (row) => <span className="font-medium">{formatCurrency(row.monthly_rent)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} type="unit" />,
  },
]

export default function UnitsPage() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()

  const { data, isLoading } = useQuery({
    queryKey: ['units', propertyId],
    queryFn: () => unitsApi.list(propertyId!, { per_page: 50 }),
    enabled: !!propertyId,
  })

  const { data: rows, meta } = data
    ? parseList<UnitAttributes>(data as never)
    : { data: [], meta: {} }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Units"
        description="All units in the selected property"
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Add Unit
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={meta?.total ?? rows.length}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/dashboard/units/${r.id}`)}
        searchable
        searchPlaceholder="Search units…"
        emptyMessage="No units found for this property."
      />
    </div>
  )
}
