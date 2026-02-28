'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { formatCents, formatDate } from '@/lib/utils'
import type { ApiInvoice, InvoiceStatus, InvoiceType } from '@/types/api'

const columns: Column<ApiInvoice>[] = [
  { key: 'invoice_number', header: 'Invoice #' },
  { key: 'invoice_type', header: 'Type' },
  { key: 'status', header: 'Status' },
  { key: 'amount_cents', header: 'Amount', render: (r) => formatCents(r.amount_cents) },
  { key: 'balance_cents', header: 'Balance', render: (r) => formatCents(r.balance_cents) },
  { key: 'due_on', header: 'Due', render: (r) => formatDate(r.due_on) },
]

function InvoicesInner() {
  const propertyId = useCurrentPropertyId()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all')
  const [type, setType] = useState<InvoiceType | 'all'>('all')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['invoices', propertyId, status, type, page],
    queryFn: () => invoicesEndpoints.list({ property_id: propertyId ?? undefined, status: status === 'all' ? undefined : status, invoice_type: type === 'all' ? undefined : type, page, per_page: 25 }),
    enabled: Boolean(propertyId),
  })

  if (!propertyId) return <ErrorState title="No property selected" message="Select a property first." />
  if (isError) return <ErrorState message="Failed to load invoices" onRetry={() => refetch()} />

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Invoice management" actions={<Link href="/app/invoices/new"><Button><Plus className="h-4 w-4" />New Invoice</Button></Link>} />
      <div className="flex flex-wrap gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus | 'all')} className="h-9 rounded-md border px-3 text-sm">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="issued">Issued</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="void">Void</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as InvoiceType | 'all')} className="h-9 rounded-md border px-3 text-sm">
          <option value="all">All types</option>
          <option value="rent">Rent</option>
          <option value="water">Water</option>
          <option value="electricity">Electricity</option>
          <option value="service_charge">Service charge</option>
          <option value="penalty">Penalty</option>
          <option value="other">Other</option>
        </select>
      </div>
      <DataTable columns={columns} data={rows} isLoading={isLoading} total={data?.meta?.total ?? rows.length} page={page} perPage={25} onPageChange={setPage} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/app/invoices/${r.id}`)} emptyMessage="No invoices found." />
    </div>
  )
}

export default function InvoicesPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'accountant']}><InvoicesInner /></RoleGate>
}
