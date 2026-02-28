'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { meterReadingsEndpoints } from '@/lib/api/endpoints/meter-readings'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/shared/loading-spinner'
import { ErrorState } from '@/components/shared/error-state'
import { formatDate } from '@/lib/utils'

function MeterReadingDetailInner() {
  const params = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['meter_readings', params.id], queryFn: () => meterReadingsEndpoints.get(params.id) })
  if (isLoading) return <PageLoader />
  if (isError || !data?.data) return <ErrorState message="Failed to load meter reading" onRetry={() => refetch()} />

  const row = data.data
  return (
    <div className="space-y-6">
      <PageHeader title="Meter Reading" description={row.id} actions={<Link href={`/app/meter-readings/${row.id}/edit`}><Button>Edit</Button></Link>} />
      <Card className="p-6 space-y-2 text-sm">
        <p>Type: {row.meter_type}</p>
        <p>Unit ID: <span className="font-mono">{row.unit_id ?? '—'}</span></p>
        <p>Value: {row.reading_value}</p>
        <p>Date: {formatDate(row.reading_on)}</p>
      </Card>
    </div>
  )
}

export default function MeterReadingDetailPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><MeterReadingDetailInner /></RoleGate>
}
