'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { pumpTopupsEndpoints } from '@/lib/api/endpoints/pump-topups'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/shared/loading-spinner'
import { ErrorState } from '@/components/shared/error-state'
import { formatCents, formatDate } from '@/lib/utils'

function PumpTopupDetailInner() {
  const params = useParams<{ id: string }>()
  const query = useQuery({ queryKey: ['pump_topups', params.id], queryFn: () => pumpTopupsEndpoints.get(params.id) })
  if (query.isLoading) return <PageLoader />
  if (query.isError || !query.data?.data) return <ErrorState message="Failed to load pump topup" onRetry={() => query.refetch()} />

  const row = query.data.data
  return (
    <div className="space-y-6">
      <PageHeader title="Pump Topup" description={row.id} actions={<Link href={`/app/pump-topups/${row.id}/edit`}><Button>Edit</Button></Link>} />
      <Card className="p-6 space-y-2 text-sm">
        <p>Date: {formatDate(row.topup_on)}</p>
        <p>Volume: {row.volume_liters}L</p>
        <p>Amount: {formatCents(row.amount_cents)}</p>
        <p>Vendor: {row.vendor_name ?? '—'}</p>
      </Card>
    </div>
  )
}

export default function PumpTopupDetailPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><PumpTopupDetailInner /></RoleGate>
}
