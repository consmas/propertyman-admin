'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { paymentsEndpoints } from '@/lib/api/endpoints/payments'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { formatCents, formatDate, humanizeStatus } from '@/lib/utils'
import type { ApiPayment } from '@/types/api'

const columns: Column<ApiPayment>[] = [
  {
    key: 'reference',
    header: 'Reference',
    render: (row) => <span className="font-mono text-xs">{row.reference}</span>,
  },
  {
    key: 'tenant_id',
    header: 'Tenant',
    render: (row) => <span className="font-mono text-xs text-gray-500">{row.tenant_id.slice(0, 8)}…</span>,
  },
  {
    key: 'amount_cents',
    header: 'Amount',
    render: (row) => <span className="font-medium">{formatCents(row.amount_cents)}</span>,
  },
  {
    key: 'payment_method',
    header: 'Method',
    render: (row) => (
      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
        {humanizeStatus(row.payment_method)}
      </span>
    ),
  },
  {
    key: 'paid_at',
    header: 'Paid At',
    render: (row) => <span className="text-sm">{formatDate(row.paid_at, 'MMM d, yyyy HH:mm')}</span>,
  },
  {
    key: 'unallocated_cents',
    header: 'Unallocated',
    render: (row) => (
      <span className={row.unallocated_cents > 0 ? 'text-amber-600 font-medium' : 'text-gray-400'}>
        {formatCents(row.unallocated_cents)}
      </span>
    ),
  },
]

export default function AppPaymentsPage() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['app-payments', propertyId, page],
    queryFn: () =>
      paymentsEndpoints.list({ property_id: propertyId ?? undefined, page, per_page: 25 }),
    enabled: !!propertyId,
  })

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Recorded tenant payments"
        actions={
          <Link href="/app/payments/new">
            <Button><Plus className="h-4 w-4" />Record Payment</Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={data?.meta?.total ?? rows.length}
        page={page}
        perPage={25}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/app/payments/${r.id}`)}
        searchable
        emptyMessage="No payments recorded yet."
      />
    </div>
  )
}
