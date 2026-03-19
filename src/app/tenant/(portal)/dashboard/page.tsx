'use client'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, FileText, Wrench, Receipt } from 'lucide-react'
import Link from 'next/link'
import { useTenantProfile } from '@/hooks/use-tenant'
import { useAuth } from '@/hooks/use-auth'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { leasesEndpoints } from '@/lib/api/endpoints/leases'
import { maintenanceEndpoints } from '@/lib/api/endpoints/maintenance'
import { KpiCard } from '@/components/shared/kpi-card'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { ApiInvoice } from '@/types/api'

const INVOICE_STATUS_VARIANT: Record<string, 'success' | 'gray' | 'danger' | 'warning'> = {
  paid: 'success',
  draft: 'gray',
  void: 'gray',
  issued: 'warning',
  partial: 'warning',
  overdue: 'danger',
}

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
  const leases = leasesRes?.data?.filter((l) => l.tenant_id === tenantId) ?? []
  const activeLease = leases.find((l) => l.status === 'active')
  const openMaintenance = (maintenanceRes?.data ?? []).filter(
    (m) => m.status === 'open' || m.status === 'in_progress'
  ).length
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.balance ?? 0), 0)

  const firstName = user?.full_name?.split(' ')[0] ?? user?.full_name ?? 'there'

  return (
    <div className="fade-up space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>
          Welcome back, {firstName}
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          Here's an overview of your tenancy
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Outstanding Balance"
          value={formatCurrency(totalOutstanding)}
          subtitle={totalOutstanding > 0 ? 'Requires payment' : 'Fully settled'}
          icon={CreditCard}
          accent={totalOutstanding > 0 ? '#ef4444' : '#10b981'}
          delay={0}
        />
        <KpiCard
          title="Lease Status"
          value={activeLease ? 'Active' : 'None'}
          subtitle={activeLease ? `Until ${formatDate(activeLease.end_date)}` : 'No active lease'}
          icon={FileText}
          accent="#8b5cf6"
          delay={80}
        />
        <KpiCard
          title="Open Requests"
          value={openMaintenance}
          subtitle={openMaintenance > 0 ? 'Maintenance pending' : 'All resolved'}
          icon={Wrench}
          accent={openMaintenance > 0 ? '#f59e0b' : '#10b981'}
          delay={160}
        />
      </div>

      {/* Recent invoices */}
      <Card className="overflow-hidden" style={{ animationDelay: '240ms' }}>
        <CardHeader
          className="flex-row items-center justify-between space-y-0 pb-4"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: '#f59e0b18', color: '#f59e0b' }}
            >
              <Receipt className="h-4 w-4" />
            </div>
            <CardTitle className="text-[15px]">Recent Invoices</CardTitle>
          </div>
          <Link
            href="/tenant/invoices"
            className="text-[12px] font-bold"
            style={{ color: 'var(--brand-600)' }}
          >
            View all →
          </Link>
        </CardHeader>

        <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
          {loadingInvoices &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3.5">
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          {!loadingInvoices && invoices.length === 0 && (
            <p className="px-6 py-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
              No invoices yet.
            </p>
          )}
          {!loadingInvoices &&
            invoices.map((invoice: ApiInvoice) => (
              <Link
                key={invoice.id}
                href={`/tenant/invoices/${invoice.id}`}
                className="flex items-center justify-between px-6 py-3.5 transition-colors"
                style={{ color: 'inherit' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-secondary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {invoice.invoice_number}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    Due {formatDate(invoice.due_date)}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-3 shrink-0">
                  <Badge variant={INVOICE_STATUS_VARIANT[invoice.status] ?? 'gray'}>
                    {invoice.status}
                  </Badge>
                  <p className="font-display text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(invoice.balance)}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </Card>
    </div>
  )
}
