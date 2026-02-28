'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { unitsEndpoints } from '@/lib/api/endpoints/units'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { formatCents } from '@/lib/utils'
import type { ApiUnit } from '@/types/api'

const columns: Column<ApiUnit>[] = [
  { key: 'unit_number', header: 'Unit' },
  { key: 'status', header: 'Status' },
  { key: 'bedrooms', header: 'Beds' },
  { key: 'bathrooms', header: 'Baths' },
  {
    key: 'rent_cents',
    header: 'Rent',
    render: (row) => formatCents(row.monthly_rent_cents ?? row.rent_cents ?? 0),
  },
]

function UnitsInner() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['units', propertyId, page],
    queryFn: () => unitsEndpoints.list({ property_id: propertyId ?? undefined, page, per_page: 25 }),
    enabled: Boolean(propertyId),
  })

  if (!propertyId) {
    return <ErrorState title="No property selected" message="Select a property to view units." />
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} message="Failed to load units" />
  }

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Units"
        description="Property units"
        actions={<Link href="/app/units/new"><Button><Plus className="h-4 w-4" />New Unit</Button></Link>}
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={data?.meta?.total ?? rows.length}
        page={page}
        perPage={25}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/app/units/${row.id}`)}
        emptyMessage="No units found for this property."
      />
    </div>
  )
}

export default function UnitsPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><UnitsInner /></RoleGate>
}
