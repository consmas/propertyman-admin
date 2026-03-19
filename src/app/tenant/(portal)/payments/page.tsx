'use client'
import { useQuery } from '@tanstack/react-query'
import { useTenantProfile } from '@/hooks/use-tenant'
import { paymentsEndpoints } from '@/lib/api/endpoints/payments'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { formatCurrency, formatDate, humanizeStatus } from '@/lib/utils'
import type { ApiPayment } from '@/types/api'

export default function TenantPaymentsPage() {
  const { data: tenant, isLoading: loadingTenant, isError: tenantError } = useTenantProfile()

  const tenantId = tenant?.id
  const propertyId = tenant?.property_id

  const { data: paymentsRes, isLoading: loadingPayments } = useQuery({
    queryKey: ['tenant-payments', tenantId, propertyId],
    queryFn: () => paymentsEndpoints.list({ tenant_id: tenantId!, property_id: propertyId! }),
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

  const payments = paymentsRes?.data ?? []

  const columns: Column<ApiPayment>[] = [
    { key: 'reference', header: 'Reference' },
    { key: 'payment_method', header: 'Method', render: (r) => humanizeStatus(r.payment_method) },
    { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'unallocated', header: 'Unallocated', render: (r) => formatCurrency(r.unallocated) },
    { key: 'paid_at', header: 'Paid On', render: (r) => formatDate(r.paid_at) },
  ]

  return (
    <div className="fade-up space-y-6">
      <DataTable
        columns={columns}
        data={payments}
        isLoading={loadingPayments}
        rowKey={(r) => r.id}
        emptyMessage="No payments recorded yet."
      />
    </div>
  )
}
