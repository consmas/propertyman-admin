'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTenantProfile } from '@/hooks/use-tenant'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate, humanizeStatus } from '@/lib/utils'
import type { ApiInvoice, InvoiceStatus } from '@/types/api'

const STATUS_OPTIONS: { value: InvoiceStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'issued', label: 'Issued' },
  { value: 'partial', label: 'Partially Paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'void', label: 'Voided' },
]

const STATUS_VARIANT: Record<string, 'success' | 'gray' | 'danger' | 'warning'> = {
  paid: 'success',
  draft: 'gray',
  void: 'gray',
  issued: 'warning',
  partial: 'warning',
  overdue: 'danger',
}

export default function TenantInvoicesPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('')
  const { data: tenant, isLoading: loadingTenant, isError: tenantError } = useTenantProfile()

  const tenantId = tenant?.id
  const propertyId = tenant?.property_id

  const { data: invoicesRes, isLoading: loadingInvoices } = useQuery({
    queryKey: ['tenant-invoices', tenantId, propertyId, statusFilter],
    queryFn: () =>
      invoicesEndpoints.list({
        tenant_id: tenantId!,
        property_id: propertyId!,
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
    enabled: Boolean(tenantId && propertyId),
  })

  if (loadingTenant) return <PageLoader />

  if (tenantError || !tenant) {
    return (
      <ErrorState
        title="Profile not found"
        message="Your tenant profile could not be loaded. Please contact your property manager."
      />
    )
  }

  const invoices = invoicesRes?.data ?? []

  const columns: Column<ApiInvoice>[] = [
    { key: 'invoice_number', header: 'Invoice #' },
    { key: 'invoice_type', header: 'Type', render: (r) => humanizeStatus(r.invoice_type) },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge variant={STATUS_VARIANT[r.status] ?? 'gray'}>{r.status}</Badge>,
    },
    { key: 'total', header: 'Total', render: (r) => formatCurrency(r.total) },
    { key: 'balance', header: 'Balance', render: (r) => formatCurrency(r.balance) },
    { key: 'issue_date', header: 'Issued', render: (r) => formatDate(r.issue_date) },
    { key: 'due_date', header: 'Due', render: (r) => formatDate(r.due_date) },
  ]

  return (
    <div className="fade-up space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as InvoiceStatus | '')}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value || '_all'}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={loadingInvoices}
        rowKey={(r) => r.id}
        onRowClick={(row) => router.push(`/tenant/invoices/${row.id}`)}
        emptyMessage="No invoices found."
      />
    </div>
  )
}
