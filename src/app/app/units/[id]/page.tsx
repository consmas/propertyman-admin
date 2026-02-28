'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { unitsEndpoints } from '@/lib/api/endpoints/units'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/shared/loading-spinner'
import { ErrorState } from '@/components/shared/error-state'
import { formatCents } from '@/lib/utils'

const UNIT_TYPE_LABELS: Record<string, string> = {
  chamber_and_hall_self_contain: 'Chamber & Hall Self Contain',
  one_bedroom_self_contain: '1 Bedroom Self Contain',
  two_bedroom_self_contain: '2 Bedroom Self Contain',
}

function UnitDetailInner() {
  const params = useParams<{ id: string }>()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['units', params.id],
    queryFn: () => unitsEndpoints.get(params.id),
  })

  if (isLoading) return <PageLoader />
  if (isError || !data?.data) return <ErrorState onRetry={() => refetch()} message="Failed to load unit" />

  const unit = data.data
  const unitTypeLabel = unit.unit_type ? (UNIT_TYPE_LABELS[unit.unit_type] ?? unit.unit_type) : '—'

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Unit ${unit.unit_number}`}
        description={`Status: ${unit.status}`}
        actions={<Link href={`/app/units/${unit.id}/edit`}><Button>Edit</Button></Link>}
      />

      <Card className="p-6 space-y-2 text-sm">
        <p><span className="text-gray-500">Block:</span> {unit.name ?? '—'}</p>
        <p><span className="text-gray-500">Type:</span> {unitTypeLabel}</p>
        <p><span className="text-gray-500">Rent:</span> {formatCents(unit.monthly_rent_cents ?? unit.rent_cents ?? 0)}</p>
        <p><span className="text-gray-500">Bedrooms:</span> {unit.bedrooms ?? '—'}</p>
        <p><span className="text-gray-500">Bathrooms:</span> {unit.bathrooms ?? '—'}</p>
      </Card>
    </div>
  )
}

export default function UnitDetailPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><UnitDetailInner /></RoleGate>
}
