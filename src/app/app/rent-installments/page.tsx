'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { leasesEndpoints } from '@/lib/api/endpoints/leases'
import { rentInstallmentsEndpoints } from '@/lib/api/endpoints/rent-installments'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { formatCents, formatDate } from '@/lib/utils'
import type { ApiRentInstallment } from '@/types/api'

const columns: Column<ApiRentInstallment>[] = [
  { key: 'due_date', header: 'Due', render: (r) => formatDate(r.due_date) },
  { key: 'amount_cents', header: 'Amount', render: (r) => formatCents(r.amount_cents) },
  { key: 'balance_cents', header: 'Balance', render: (r) => formatCents(r.balance_cents) },
  { key: 'status', header: 'Status' },
]

function RentInstallmentsInner() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const [leaseId, setLeaseId] = useState<string>('')

  const leases = useQuery({
    queryKey: ['leases', 'options', propertyId],
    queryFn: () => leasesEndpoints.list({ property_id: propertyId ?? undefined, per_page: 100 }),
    enabled: Boolean(propertyId),
  })

  const installments = useQuery({
    queryKey: ['rent_installments', leaseId],
    queryFn: () => rentInstallmentsEndpoints.list({ lease_id: leaseId || undefined, per_page: 100 }),
  })

  if (!propertyId) return <ErrorState title="No property selected" message="Select a property first." />
  if (leases.isError || installments.isError) return <ErrorState message="Failed to load installments" onRetry={() => installments.refetch()} />

  const rows = installments.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Rent Installments" description="Generated from leases" />
      <select className="h-9 rounded-md border px-3 text-sm" value={leaseId} onChange={(e) => setLeaseId(e.target.value)}>
        <option value="">All leases</option>
        {(leases.data?.data ?? []).map((lease) => (
          <option key={lease.id} value={lease.id}>{lease.id.slice(0, 8)}…</option>
        ))}
      </select>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={leases.isLoading || installments.isLoading}
        total={installments.data?.meta?.total ?? rows.length}
        rowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/app/rent-installments/${row.id}`)}
        emptyMessage="No rent installments found."
      />
    </div>
  )
}

export default function RentInstallmentsPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'accountant']}><RentInstallmentsInner /></RoleGate>
}
