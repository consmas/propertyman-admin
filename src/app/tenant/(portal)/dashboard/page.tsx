'use client'
import { useQuery } from '@tanstack/react-query'
import { useTenantProfile } from '@/hooks/use-tenant'
import { useAuth } from '@/hooks/use-auth'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { leasesEndpoints } from '@/lib/api/endpoints/leases'
import { maintenanceEndpoints } from '@/lib/api/endpoints/maintenance'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { formatCurrency, formatDate, humanizeStatus } from '@/lib/utils'
import type { ApiInvoice } from '@/types/api'
import Link from 'next/link'

export default function TenantDashboard() {
  const { user } = useAuth()
  const { data: tenant, isLoading: loadingTenant, isError: tenantError } = useTenantProfile()

  const tenantId = tenant?.id
  const propertyId = tenant?.property_id

  const { data: invoicesRes, isLoading: loadingInvoices } = useQuery({
    queryKey: ['tenant-invoices-recent', tenantId],
    queryFn: () => invoicesEndpoints.list({ tenant_id: tenantId!, property_id: propertyId!, per_page: 5 }),
    enabled: Boolean(tenantId && propertyId),
  })

  const { data: leasesRes } = useQuery({
    queryKey: ['tenant-leases', tenantId, propertyId],
    queryFn: () => leasesEndpoints.list({ property_id: propertyId! }),
    enabled: Boolean(propertyId),
  })

  const { data: maintenanceRes } = useQuery({
    queryKey: ['tenant-maintenance', propertyId],
    queryFn: () => maintenanceEndpoints.list({ property_id: propertyId! }),
    enabled: Boolean(propertyId),
  })

  if (loadingTenant) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
        Loading your profile…
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
  const leases = leasesRes?.data?.filter(l => l.tenant_id === tenantId) ?? []
  const activeLease = leases.find(l => l.status === 'active')
  const maintenanceRequests = maintenanceRes?.data ?? []
  const openMaintenance = maintenanceRequests.filter(
    m => m.status === 'open' || m.status === 'in_progress'
  ).length
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.balance ?? 0), 0)

  const invoiceColumns: Column<ApiInvoice>[] = [
    { key: 'invoice_number', header: 'Invoice #' },
    { key: 'invoice_type', header: 'Type', render: r => humanizeStatus(r.invoice_type) },
    { key: 'status', header: 'Status', render: r => humanizeStatus(r.status) },
    { key: 'total', header: 'Amount', render: r => formatCurrency(r.total) },
    { key: 'balance', header: 'Balance', render: r => formatCurrency(r.balance) },
    { key: 'due_date', header: 'Due', render: r => formatDate(r.due_date) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.full_name?.split(' ')[0] ?? user?.full_name}`}
        description="Here's an overview of your tenancy"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Outstanding Balance</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lease Status</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 capitalize">{activeLease?.status ?? '—'}</p>
          {activeLease && (
            <p className="text-xs text-gray-400 mt-1">Until {formatDate(activeLease.end_date)}</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Open Requests</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{openMaintenance}</p>
          <p className="text-xs text-gray-400 mt-1">maintenance</p>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent Invoices</h2>
          <Link
            href="/tenant/invoices"
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View all →
          </Link>
        </div>
        <DataTable
          columns={invoiceColumns}
          data={invoices}
          isLoading={loadingInvoices}
          rowKey={r => r.id}
          emptyMessage="No invoices yet."
        />
      </div>
    </div>
  )
}
