'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { meterReadingsEndpoints } from '@/lib/api/endpoints/meter-readings'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { ApiMeterReading, MeterType } from '@/types/api'

const columns: Column<ApiMeterReading>[] = [
  { key: 'meter_type', header: 'Type' },
  { key: 'unit_id', header: 'Unit', render: (r) => r.unit_id ?? '—' },
  { key: 'reading_value', header: 'Reading' },
  { key: 'reading_on', header: 'Date', render: (r) => formatDate(r.reading_on) },
]

function MeterReadingsInner() {
  const propertyId = useCurrentPropertyId()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [type, setType] = useState<MeterType | 'all'>('all')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['meter_readings', propertyId, type, page],
    queryFn: () => meterReadingsEndpoints.list({ property_id: propertyId ?? undefined, meter_type: type === 'all' ? undefined : type, page, per_page: 25 }),
    enabled: Boolean(propertyId),
  })

  if (!propertyId) return <ErrorState title="No property selected" message="Select a property first." />
  if (isError) return <ErrorState message="Failed to load meter readings" onRetry={() => refetch()} />

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Meter Readings" description="Usage snapshots" actions={<Link href="/app/meter-readings/new"><Button><Plus className="h-4 w-4" />New Reading</Button></Link>} />
      <select className="h-9 rounded-md border px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as MeterType | 'all')}>
        <option value="all">All types</option><option value="water">Water</option><option value="electricity">Electricity</option><option value="gas">Gas</option><option value="other">Other</option>
      </select>
      <DataTable columns={columns} data={rows} isLoading={isLoading} total={data?.meta?.total ?? rows.length} page={page} perPage={25} onPageChange={setPage} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/app/meter-readings/${r.id}`)} emptyMessage="No readings found." />
    </div>
  )
}

export default function MeterReadingsPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><MeterReadingsInner /></RoleGate>
}
