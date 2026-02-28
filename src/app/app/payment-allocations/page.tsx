'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { paymentAllocationsEndpoints } from '@/lib/api/endpoints/payment-allocations'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { formatCents, formatDate } from '@/lib/utils'
import type { ApiPaymentAllocation } from '@/types/api'

const columns: Column<ApiPaymentAllocation>[] = [
  { key: 'payment_id', header: 'Payment', render: (r) => <span className="font-mono text-xs">{r.payment_id}</span> },
  { key: 'invoice_id', header: 'Invoice', render: (r) => <span className="font-mono text-xs">{r.invoice_id}</span> },
  { key: 'amount_cents', header: 'Amount', render: (r) => formatCents(r.amount_cents) },
  { key: 'allocated_at', header: 'Allocated', render: (r) => formatDate(r.allocated_at) },
]

function PaymentAllocationsInner() {
  const router = useRouter()
  const [paymentId, setPaymentId] = useState('')
  const [invoiceId, setInvoiceId] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['payment_allocations', paymentId, invoiceId],
    queryFn: () => paymentAllocationsEndpoints.list({ payment_id: paymentId || undefined, invoice_id: invoiceId || undefined, per_page: 50 }),
  })

  if (isError) return <ErrorState message="Failed to load allocations" onRetry={() => refetch()} />

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Allocations" description="How payments were distributed to invoices" />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <input value={paymentId} onChange={(e) => setPaymentId(e.target.value)} placeholder="Filter by payment ID" className="h-9 rounded-md border px-3 text-sm font-mono" />
        <input value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} placeholder="Filter by invoice ID" className="h-9 rounded-md border px-3 text-sm font-mono" />
      </div>
      <DataTable columns={columns} data={rows} isLoading={isLoading} total={data?.meta?.total ?? rows.length} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/app/payment-allocations/${r.id}`)} emptyMessage="No allocations found." />
    </div>
  )
}

export default function PaymentAllocationsPage() {
  return <RoleGate roles={['owner', 'admin', 'accountant']}><PaymentAllocationsInner /></RoleGate>
}
