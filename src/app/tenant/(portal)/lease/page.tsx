'use client'
import { useQuery } from '@tanstack/react-query'
import { useTenantProfile } from '@/hooks/use-tenant'
import { leasesEndpoints } from '@/lib/api/endpoints/leases'
import { rentInstallmentsEndpoints } from '@/lib/api/endpoints/rent-installments'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { formatCurrency, formatDate, humanizeStatus } from '@/lib/utils'
import type { ApiRentInstallment } from '@/types/api'

export default function TenantLeasePage() {
  const { data: tenant, isLoading: loadingTenant, isError: tenantError } = useTenantProfile()

  const tenantId = tenant?.id
  const propertyId = tenant?.property_id

  const { data: leasesRes, isLoading: loadingLeases } = useQuery({
    queryKey: ['tenant-leases-full', tenantId, propertyId],
    queryFn: () => leasesEndpoints.list({ property_id: propertyId! }),
    enabled: Boolean(propertyId),
  })

  const leases = leasesRes?.data?.filter(l => l.tenant_id === tenantId) ?? []
  const activeLease = leases.find(l => l.status === 'active') ?? leases[0]

  const { data: installmentsRes, isLoading: loadingInstallments } = useQuery({
    queryKey: ['tenant-installments', activeLease?.id],
    queryFn: () => rentInstallmentsEndpoints.list({ lease_id: activeLease!.id }),
    enabled: Boolean(activeLease?.id),
  })

  if (loadingTenant || loadingLeases) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
        Loading lease details…
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

  const installmentColumns: Column<ApiRentInstallment>[] = [
    { key: 'due_date', header: 'Due Date', render: r => formatDate(r.due_date) },
    { key: 'amount', header: 'Amount', render: r => formatCurrency(r.amount) },
    { key: 'status', header: 'Status', render: r => humanizeStatus(r.status) },
    { key: 'paid_at', header: 'Paid On', render: r => r.paid_at ? formatDate(r.paid_at) : '—' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="My Lease" description="Your current lease details and payment schedule" />

      {!activeLease ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500 text-sm">No active lease found.</p>
          <p className="text-gray-400 text-xs mt-1">Contact your property manager for more information.</p>
        </div>
      ) : (
        <>
          {/* Lease details card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Lease Details</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Status</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 capitalize">{activeLease.status}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Start Date</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(activeLease.start_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">End Date</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(activeLease.end_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Monthly Rent</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">{formatCurrency(activeLease.rent)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Security Deposit</p>
                <p className="mt-1 text-sm text-gray-900">{formatCurrency(activeLease.security_deposit)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Plan</p>
                <p className="mt-1 text-sm text-gray-900">{activeLease.plan_months} months</p>
              </div>
              {activeLease.paid_through_date && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Paid Through</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(activeLease.paid_through_date)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Installment schedule */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Payment Schedule</h2>
            <DataTable
              columns={installmentColumns}
              data={installmentsRes?.data ?? []}
              isLoading={loadingInstallments}
              rowKey={r => r.id}
              emptyMessage="No installments found."
            />
          </div>
        </>
      )}
    </div>
  )
}
