'use client'

import { useQueries } from '@tanstack/react-query'
import { Building2, Home, FileText, Wrench, CreditCard, TrendingUp } from 'lucide-react'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { propertiesEndpoints } from '@/lib/api/endpoints/properties'
import { unitsEndpoints } from '@/lib/api/endpoints/units'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { maintenanceEndpoints } from '@/lib/api/endpoints/maintenance'
import { paymentsEndpoints } from '@/lib/api/endpoints/payments'
import { KpiCard } from '@/components/shared/kpi-card'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorState } from '@/components/shared/error-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AppDashboardPage() {
  const propertyId = useCurrentPropertyId()

  const [propertiesQ, unitsQ, invoicesQ, maintenanceQ, paymentsQ] = useQueries({
    queries: [
      { queryKey: ['properties', 'dashboard'], queryFn: () => propertiesEndpoints.list({ per_page: 200 }) },
      { queryKey: ['units', 'dashboard', propertyId], queryFn: () => unitsEndpoints.list({ property_id: propertyId ?? undefined, per_page: 200 }), enabled: Boolean(propertyId) },
      { queryKey: ['invoices', 'dashboard', propertyId], queryFn: () => invoicesEndpoints.list({ property_id: propertyId ?? undefined, per_page: 10 }), enabled: Boolean(propertyId) },
      { queryKey: ['maintenance', 'dashboard', propertyId], queryFn: () => maintenanceEndpoints.list({ property_id: propertyId ?? undefined, per_page: 10 }), enabled: Boolean(propertyId) },
      { queryKey: ['payments', 'dashboard', propertyId], queryFn: () => paymentsEndpoints.list({ property_id: propertyId ?? undefined, per_page: 10 }), enabled: Boolean(propertyId) },
    ],
  })

  const hasError = [propertiesQ, unitsQ, invoicesQ, maintenanceQ, paymentsQ].some((q) => q.isError)
  if (hasError) return <ErrorState message="Failed to load dashboard" onRetry={() => window.location.reload()} />

  const properties = propertiesQ.data?.data ?? []
  const units = unitsQ.data?.data ?? []
  const invoices = invoicesQ.data?.data ?? []
  const maintenance = maintenanceQ.data?.data ?? []
  const payments = paymentsQ.data?.data ?? []

  const occupiedUnits = units.filter((u) => u.status === 'occupied').length
  const occupancyRate = units.length > 0 ? Math.round((occupiedUnits / units.length) * 100) : 0
  const openInvoices = invoices.filter((inv) => ['issued', 'partial', 'overdue'].includes(inv.status))
  const pendingMaintenance = maintenance.filter((req) => ['open', 'in_progress'].includes(req.status))

  return (
    <div className="space-y-7">
      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Properties"
          value={propertiesQ.isLoading ? '—' : properties.length}
          subtitle={properties.length > 0 ? `${properties.length} managed` : undefined}
          icon={Building2}
          accent="#8b5cf6"
          chartData={[2, 2, 3, properties.length]}
          isLoading={propertiesQ.isLoading}
          delay={0}
        />
        <KpiCard
          title="Occupancy Rate"
          value={unitsQ.isLoading ? '—' : `${occupancyRate}%`}
          subtitle={units.length > 0 ? `${occupiedUnits} of ${units.length} units` : undefined}
          icon={Home}
          accent="#10b981"
          chartData={[70, 75, 80, occupancyRate]}
          isLoading={unitsQ.isLoading}
          delay={80}
        />
        <KpiCard
          title="Open Invoices"
          value={invoicesQ.isLoading ? '—' : openInvoices.length}
          subtitle={openInvoices.length > 0 ? `${openInvoices.length} require attention` : 'All settled'}
          icon={FileText}
          accent="#f59e0b"
          chartData={[5, 8, 6, openInvoices.length]}
          isLoading={invoicesQ.isLoading}
          delay={160}
        />
        <KpiCard
          title="Pending Maintenance"
          value={maintenanceQ.isLoading ? '—' : pendingMaintenance.length}
          subtitle={pendingMaintenance.length > 0 ? `${pendingMaintenance.length} open requests` : 'All resolved'}
          icon={Wrench}
          accent="#ef4444"
          chartData={[10, 8, 9, pendingMaintenance.length]}
          isLoading={maintenanceQ.isLoading}
          delay={240}
        />
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Latest Payments */}
        <Card className="fade-up overflow-hidden" style={{ animationDelay: '300ms' }}>
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[var(--border-default)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: '#10b98118', color: '#10b981' }}>
                <CreditCard className="h-4 w-4" />
              </div>
              <CardTitle className="text-[15px]">Latest Payments</CardTitle>
            </div>
            <span className="text-[12px] font-bold text-[var(--text-tertiary)]">
              {paymentsQ.isLoading ? '—' : `${payments.length} total`}
            </span>
          </CardHeader>
          <div className="divide-y divide-[var(--border-default)]">
            {paymentsQ.isLoading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3.5">
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            {!paymentsQ.isLoading && payments.length === 0 && (
              <p className="px-6 py-6 text-sm text-[var(--text-secondary)]">No payments yet.</p>
            )}
            {!paymentsQ.isLoading && payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{payment.reference}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    {payment.payment_method.replace('_', ' ')} · {formatDate(payment.paid_at, 'MMM d, yyyy')}
                  </p>
                </div>
                <p className="font-display text-[13px] font-bold text-[var(--text-primary)] ml-3 shrink-0">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Latest Maintenance */}
        <Card className="fade-up overflow-hidden" style={{ animationDelay: '380ms' }}>
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[var(--border-default)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: '#ef444418', color: '#ef4444' }}>
                <Wrench className="h-4 w-4" />
              </div>
              <CardTitle className="text-[15px]">Maintenance</CardTitle>
            </div>
            <span className="text-[12px] font-bold text-[var(--text-tertiary)]">
              {maintenanceQ.isLoading ? '—' : `${maintenance.length} total`}
            </span>
          </CardHeader>
          <div className="divide-y divide-[var(--border-default)]">
            {maintenanceQ.isLoading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-6 py-3.5 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
            {!maintenanceQ.isLoading && maintenance.length === 0 && (
              <p className="px-6 py-6 text-sm text-[var(--text-secondary)]">No maintenance requests.</p>
            )}
            {!maintenanceQ.isLoading && maintenance.slice(0, 5).map((item) => (
              <div key={item.id} className="px-6 py-3.5">
                <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{item.title}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={item.status} type="maintenance" />
                  <StatusBadge status={item.priority} type="maintenance_priority" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Latest Invoices */}
        <Card className="fade-up overflow-hidden" style={{ animationDelay: '460ms' }}>
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[var(--border-default)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: '#f59e0b18', color: '#f59e0b' }}>
                <TrendingUp className="h-4 w-4" />
              </div>
              <CardTitle className="text-[15px]">Invoices</CardTitle>
            </div>
            <span className="text-[12px] font-bold text-[var(--text-tertiary)]">
              {invoicesQ.isLoading ? '—' : `${invoices.length} total`}
            </span>
          </CardHeader>
          <div className="divide-y divide-[var(--border-default)]">
            {invoicesQ.isLoading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3.5">
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            {!invoicesQ.isLoading && invoices.length === 0 && (
              <p className="px-6 py-6 text-sm text-[var(--text-secondary)]">No invoices yet.</p>
            )}
            {!invoicesQ.isLoading && invoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between px-6 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{invoice.invoice_number}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={invoice.status} type="invoice" />
                    <span className="text-[11px] text-[var(--text-tertiary)]">Due {formatDate(invoice.due_date)}</span>
                  </div>
                </div>
                <p className="font-display text-[13px] font-bold text-[var(--text-primary)] ml-3 shrink-0">
                  {formatCurrency(invoice.balance)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
