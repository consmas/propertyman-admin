'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { paymentAllocationsEndpoints } from '@/lib/api/endpoints/payment-allocations'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { PageLoader } from '@/components/shared/loading-spinner'
import { ErrorState } from '@/components/shared/error-state'
import { formatCents, formatDate } from '@/lib/utils'

function AllocationDetailInner() {
  const params = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['payment_allocations', params.id], queryFn: () => paymentAllocationsEndpoints.get(params.id) })
  if (isLoading) return <PageLoader />
  if (isError || !data?.data) return <ErrorState message="Failed to load allocation" onRetry={() => refetch()} />

  const allocation = data.data
  return (
    <div className="space-y-6">
      <PageHeader title="Payment Allocation" description={allocation.id} />
      <Card className="p-6 space-y-2 text-sm">
        <p>Payment: <span className="font-mono">{allocation.payment_id}</span></p>
        <p>Invoice: <span className="font-mono">{allocation.invoice_id}</span></p>
        <p>Amount: {formatCents(allocation.amount_cents)}</p>
        <p>Allocated at: {formatDate(allocation.allocated_at)}</p>
      </Card>
    </div>
  )
}

export default function PaymentAllocationDetailPage() {
  return <RoleGate roles={['owner', 'admin', 'accountant']}><AllocationDetailInner /></RoleGate>
}
