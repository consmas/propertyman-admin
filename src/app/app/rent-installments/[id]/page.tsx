'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { rentInstallmentsEndpoints } from '@/lib/api/endpoints/rent-installments'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { PageLoader } from '@/components/shared/loading-spinner'
import { ErrorState } from '@/components/shared/error-state'
import { formatCents, formatDate } from '@/lib/utils'

function RentInstallmentDetailInner() {
  const params = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['rent_installments', params.id], queryFn: () => rentInstallmentsEndpoints.get(params.id) })
  if (isLoading) return <PageLoader />
  if (isError || !data?.data) return <ErrorState message="Failed to load installment" onRetry={() => refetch()} />

  const row = data.data
  return (
    <div className="space-y-6">
      <PageHeader title="Rent Installment" description={row.id} />
      <Card className="p-6 space-y-2 text-sm">
        <p>Lease: <span className="font-mono">{row.lease_id}</span></p>
        <p>Due date: {formatDate(row.due_date)}</p>
        <p>Amount: {formatCents(row.amount_cents)}</p>
        <p>Balance: {formatCents(row.balance_cents)}</p>
        <p>Status: {row.status}</p>
      </Card>
    </div>
  )
}

export default function RentInstallmentDetailPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'accountant']}><RentInstallmentDetailInner /></RoleGate>
}
