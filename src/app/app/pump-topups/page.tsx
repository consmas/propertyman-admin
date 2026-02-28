'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { pumpTopupsEndpoints } from '@/lib/api/endpoints/pump-topups'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { formatCents, formatDate } from '@/lib/utils'
import type { ApiPumpTopup } from '@/types/api'

const columns: Column<ApiPumpTopup>[] = [
  { key: 'topup_on', header: 'Date', render: (r) => formatDate(r.topup_on) },
  { key: 'volume_liters', header: 'Volume (L)' },
  { key: 'amount_cents', header: 'Amount', render: (r) => formatCents(r.amount_cents) },
  { key: 'vendor_name', header: 'Vendor', render: (r) => r.vendor_name ?? '—' },
]

function PumpTopupsInner() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['pump_topups', propertyId, page],
    queryFn: () => pumpTopupsEndpoints.list({ property_id: propertyId ?? undefined, page, per_page: 25 }),
    enabled: Boolean(propertyId),
  })

  if (!propertyId) return <ErrorState title="No property selected" message="Select a property first." />
  if (isError) return <ErrorState message="Failed to load pump topups" onRetry={() => refetch()} />

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Pump Topups" description="Water pump topup history" actions={<Link href="/app/pump-topups/new"><Button><Plus className="h-4 w-4" />New Topup</Button></Link>} />
      <DataTable columns={columns} data={rows} isLoading={isLoading} total={data?.meta?.total ?? rows.length} page={page} perPage={25} onPageChange={setPage} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/app/pump-topups/${r.id}`)} emptyMessage="No pump topups found." />
    </div>
  )
}

export default function PumpTopupsPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><PumpTopupsInner /></RoleGate>
}
