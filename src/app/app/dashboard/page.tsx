'use client'

import { useQueries } from '@tanstack/react-query'
import { Building2, Home, FileText, Wrench } from 'lucide-react'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { propertiesEndpoints } from '@/lib/api/endpoints/properties'
import { unitsEndpoints } from '@/lib/api/endpoints/units'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { maintenanceEndpoints } from '@/lib/api/endpoints/maintenance'
import { paymentsEndpoints } from '@/lib/api/endpoints/payments'
import { PageHeader } from '@/components/shared/page-header'
import { KpiCard } from '@/components/shared/kpi-card'
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/shared/error-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatCents, formatDate } from '@/lib/utils'

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

  const openInvoices = invoices.filter((inv) => ['issued', 'partial', 'overdue'].includes(inv.status))
  const pendingMaintenance = maintenance.filter((req) => ['open', 'in_progress'].includes(req.status))
  const selectedProperty = propertyId ? properties.find((p) => p.id === propertyId) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        kicker="Operations Overview"
        description={
          selectedProperty
            ? `${selectedProperty.name} • ${selectedProperty.city}`
            : 'Portfolio overview'
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Properties" value={properties.length} icon={Building2} isLoading={propertiesQ.isLoading} />
        <KpiCard title="Units" value={units.length} icon={Home} isLoading={unitsQ.isLoading} />
        <KpiCard title="Open Invoices" value={openInvoices.length} icon={FileText} isLoading={invoicesQ.isLoading} />
        <KpiCard title="Pending Maintenance" value={pendingMaintenance.length} icon={Wrench} isLoading={maintenanceQ.isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between border-b border-[var(--border-default)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Latest Payments</h3>
            <p className="text-xs text-[var(--text-tertiary)]">{payments.length} total</p>
          </div>
          {payments.length === 0 && <p className="text-sm text-[var(--text-secondary)]">No payments yet.</p>}
          {payments.slice(0, 5).map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between border-b border-[var(--border-default)] py-2.5 text-sm last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--text-primary)]">{payment.reference}</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {payment.payment_method.replace('_', ' ')} • {formatDate(payment.paid_at, 'MMM d, yyyy HH:mm')}
                </p>
              </div>
              <p className="font-mono font-semibold text-[var(--text-primary)]">{formatCents(payment.amount_cents)}</p>
            </div>
          ))}
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between border-b border-[var(--border-default)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Latest Maintenance</h3>
            <p className="text-xs text-[var(--text-tertiary)]">{maintenance.length} total</p>
          </div>
          {maintenance.length === 0 && (
            <p className="text-sm text-[var(--text-secondary)]">No maintenance requests.</p>
          )}
          {maintenance.slice(0, 5).map((item) => (
            <div key={item.id} className="border-b border-[var(--border-default)] py-2.5 text-sm last:border-b-0">
              <p className="truncate font-semibold text-[var(--text-primary)]">{item.title}</p>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={item.status} type="maintenance" />
                <StatusBadge status={item.priority} type="maintenance_priority" />
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between border-b border-[var(--border-default)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Latest Invoices</h3>
            <p className="text-xs text-[var(--text-tertiary)]">{invoices.length} total</p>
          </div>
          {invoices.length === 0 && <p className="text-sm text-[var(--text-secondary)]">No invoices yet.</p>}
          {invoices.slice(0, 5).map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between border-b border-[var(--border-default)] py-2.5 text-sm last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--text-primary)]">{invoice.invoice_number}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Due {formatDate(invoice.due_on)}</p>
                <div className="mt-1">
                  <StatusBadge status={invoice.status} type="invoice" />
                </div>
              </div>
              <p className="font-mono font-semibold text-[var(--text-primary)]">
                {formatCents(invoice.balance_cents)}
              </p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
