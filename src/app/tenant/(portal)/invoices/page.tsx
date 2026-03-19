'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTenantProfile } from '@/hooks/use-tenant'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
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

  if (loadingTenant) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
        Loading profile…
      </div>
    )
  }

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
    { key: 'invoice_type', header: 'Type', render: r => humanizeStatus(r.invoice_type) },
    { key: 'status', header: 'Status', render: r => humanizeStatus(r.status) },
    { key: 'total', header: 'Total', render: r => formatCurrency(r.total) },
    { key: 'balance', header: 'Balance', render: r => formatCurrency(r.balance) },
    { key: 'issue_date', header: 'Issued', render: r => formatDate(r.issue_date) },
    { key: 'due_date', header: 'Due', render: r => formatDate(r.due_date) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="All invoices for your tenancy" />

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as InvoiceStatus | '')}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={loadingInvoices}
        rowKey={r => r.id}
        onRowClick={row => router.push(`/tenant/invoices/${row.id}`)}
        emptyMessage="No invoices found."
      />
    </div>
  )
}
