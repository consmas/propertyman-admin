'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CreditCard, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { paymentsEndpoints } from '@/lib/api/endpoints/payments'
import { PageHeader } from '@/components/shared/page-header'
import { KpiCard } from '@/components/shared/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCents, formatDate, humanizeStatus } from '@/lib/utils'
import type { ApiPayment } from '@/types/api'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 text-sm text-gray-900">{value ?? '—'}</div>
    </div>
  )
}

export default function PaymentDetailPage({
  params,
}: {
  params: Promise<{ paymentId: string }>
}) {
  const { paymentId } = use(params)

  const { data, isLoading } = useQuery({
    queryKey: ['app-payment', paymentId],
    queryFn: () => paymentsEndpoints.get(paymentId),
  })

  const payment: ApiPayment | undefined = data?.data

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!payment) return null

  const hasAllocations = payment.allocations?.length > 0

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/app/payments">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title="Payment"
          description={`Ref: ${payment.reference}`}
          actions={
            payment.unallocated_cents > 0 && (
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                {formatCents(payment.unallocated_cents)} unallocated
              </span>
            )
          }
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          title="Amount Received"
          value={formatCents(payment.amount_cents)}
          icon={DollarSign}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <KpiCard
          title="Unallocated Balance"
          value={formatCents(payment.unallocated_cents)}
          subtitle={payment.unallocated_cents > 0 ? 'Pending allocation' : 'Fully allocated'}
          icon={CreditCard}
          iconBg={payment.unallocated_cents > 0 ? 'bg-amber-50' : 'bg-gray-50'}
          iconColor={payment.unallocated_cents > 0 ? 'text-amber-600' : 'text-gray-400'}
        />
      </div>

      {/* Payment Details */}
      <Card>
        <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <DetailRow label="Reference" value={<span className="font-mono text-xs">{payment.reference}</span>} />
          <DetailRow label="Method" value={humanizeStatus(payment.payment_method)} />
          <DetailRow label="Paid At" value={formatDate(payment.paid_at, 'MMM d, yyyy HH:mm')} />
          <DetailRow label="Tenant ID" value={<span className="font-mono text-xs">{payment.tenant_id}</span>} />
          {payment.notes && (
            <div className="sm:col-span-2">
              <DetailRow label="Notes" value={payment.notes} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allocations */}
      <Card>
        <CardHeader>
          <CardTitle>Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          {hasAllocations ? (
            <div className="divide-y divide-gray-100">
              {payment.allocations.map((alloc, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {alloc.invoice_number ?? <span className="font-mono text-xs text-gray-500">{alloc.invoice_id.slice(0, 8)}…</span>}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">{alloc.invoice_id}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {formatCents(alloc.amount_cents)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-2">No allocations yet.</p>
          )}
        </CardContent>
      </Card>

      {/* IDs */}
      <Card>
        <CardHeader><CardTitle>References</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailRow label="Payment ID" value={<span className="font-mono text-xs">{payment.id}</span>} />
          <DetailRow label="Property ID" value={<span className="font-mono text-xs">{payment.property_id}</span>} />
          <DetailRow label="Created" value={formatDate(payment.created_at)} />
          <DetailRow label="Updated" value={formatDate(payment.updated_at)} />
        </CardContent>
      </Card>
    </div>
  )
}
