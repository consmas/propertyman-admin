'use client'
import { useQuery } from '@tanstack/react-query'
import { useTenantProfile } from '@/hooks/use-tenant'
import { leasesEndpoints } from '@/lib/api/endpoints/leases'
import { rentInstallmentsEndpoints } from '@/lib/api/endpoints/rent-installments'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { formatCurrency, formatDate, humanizeStatus } from '@/lib/utils'
import type { ApiRentInstallment } from '@/types/api'

const INSTALLMENT_STATUS_VARIANT: Record<string, 'success' | 'gray' | 'danger' | 'warning'> = {
  paid: 'success',
  unpaid: 'warning',
  overdue: 'danger',
  pending: 'gray',
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-start justify-between gap-4 py-3"
      style={{ borderBottom: '1px solid var(--border-default)' }}
    >
      <span
        className="text-[12px] font-bold uppercase tracking-[0.07em] shrink-0 mt-0.5 min-w-[140px]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </span>
      <span className="text-[13px] font-medium text-right" style={{ color: 'var(--text-primary)' }}>
        {children}
      </span>
    </div>
  )
}

export default function TenantLeasePage() {
  const { data: tenant, isLoading: loadingTenant, isError: tenantError } = useTenantProfile()

  const tenantId = tenant?.id
  const propertyId = tenant?.property_id

  const { data: leasesRes, isLoading: loadingLeases } = useQuery({
    queryKey: ['tenant-leases-full', tenantId, propertyId],
    queryFn: () => leasesEndpoints.list({ property_id: propertyId! }),
    enabled: Boolean(propertyId),
  })

  const leases = leasesRes?.data?.filter((l) => l.tenant_id === tenantId) ?? []
  const activeLease = leases.find((l) => l.status === 'active') ?? leases[0]

  const { data: installmentsRes, isLoading: loadingInstallments } = useQuery({
    queryKey: ['tenant-installments', activeLease?.id],
    queryFn: () => rentInstallmentsEndpoints.list({ lease_id: activeLease!.id }),
    enabled: Boolean(activeLease?.id),
  })

  if (loadingTenant || loadingLeases) return <PageLoader />

  if (tenantError || !tenant) {
    return (
      <ErrorState
        title="Profile not found"
        message="Your tenant profile could not be loaded. Please contact your property manager."
      />
    )
  }

  const installmentColumns: Column<ApiRentInstallment>[] = [
    { key: 'due_date', header: 'Due Date', render: (r) => formatDate(r.due_date) },
    { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={INSTALLMENT_STATUS_VARIANT[r.status] ?? 'gray'}>
          {humanizeStatus(r.status)}
        </Badge>
      ),
    },
    { key: 'paid_at', header: 'Paid On', render: (r) => (r.paid_at ? formatDate(r.paid_at) : '—') },
  ]

  return (
    <div className="fade-up space-y-6 max-w-4xl">
      {!activeLease ? (
        <Card className="p-8 text-center">
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            No active lease found.
          </p>
          <p className="text-[12px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Contact your property manager for more information.
          </p>
        </Card>
      ) : (
        <>
          {/* Lease details */}
          <Card className="p-6">
            <h3
              className="font-display text-[15px] font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Lease Details
            </h3>
            <DetailRow label="Status">
              <Badge variant={activeLease.status === 'active' ? 'success' : 'gray'}>
                {activeLease.status}
              </Badge>
            </DetailRow>
            <DetailRow label="Start Date">{formatDate(activeLease.start_date)}</DetailRow>
            <DetailRow label="End Date">{formatDate(activeLease.end_date)}</DetailRow>
            <DetailRow label="Monthly Rent">
              <span
                className="font-display font-bold"
                style={{ color: 'var(--brand-600)' }}
              >
                {formatCurrency(activeLease.rent)}
              </span>
            </DetailRow>
            <DetailRow label="Security Deposit">{formatCurrency(activeLease.security_deposit)}</DetailRow>
            <DetailRow label="Plan">{activeLease.plan_months} months</DetailRow>
            {activeLease.paid_through_date && (
              <DetailRow label="Paid Through">{formatDate(activeLease.paid_through_date)}</DetailRow>
            )}
          </Card>

          {/* Payment schedule */}
          <Card className="p-6">
            <h3
              className="font-display text-[15px] font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Payment Schedule
            </h3>
            <DataTable
              columns={installmentColumns}
              data={installmentsRes?.data ?? []}
              isLoading={loadingInstallments}
              rowKey={(r) => r.id}
              emptyMessage="No installments found."
            />
          </Card>
        </>
      )}
    </div>
  )
}
