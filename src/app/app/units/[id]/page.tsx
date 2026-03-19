'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { unitsEndpoints } from '@/lib/api/endpoints/units'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/shared/loading-spinner'
import { ErrorState } from '@/components/shared/error-state'
import { formatCurrency } from '@/lib/utils'

const UNIT_TYPE_LABELS: Record<string, string> = {
  chamber_and_hall_self_contain: 'Chamber & Hall Self Contain',
  one_bedroom_self_contain: '1 Bedroom Self Contain',
  two_bedroom_self_contain: '2 Bedroom Self Contain',
}

function UnitDetailInner() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['units', params.id],
    queryFn: () => unitsEndpoints.get(params.id),
  })

  const { mutate: deleteUnit, isPending: isDeleting } = useMutation({
    mutationFn: () => unitsEndpoints.delete(params.id),
    onSuccess: () => {
      toast.success('Unit deleted')
      queryClient.invalidateQueries({ queryKey: ['units'] })
      router.push('/app/units')
    },
    onError: () => toast.error('Failed to delete unit'),
  })

  const handleDelete = () => {
    if (window.confirm('Delete this unit? This cannot be undone.')) deleteUnit()
  }

  if (isLoading) return <PageLoader />
  if (isError || !data?.data) return <ErrorState onRetry={() => refetch()} message="Failed to load unit" />

  const unit = data.data
  const unitTypeLabel = unit.unit_type ? (UNIT_TYPE_LABELS[unit.unit_type] ?? unit.unit_type) : '—'

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Unit ${unit.unit_number}`}
        description={`Status: ${unit.status}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/app/units/${unit.id}/edit`}><Button variant="outline">Edit</Button></Link>
            <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>Delete</Button>
          </div>
        }
      />

      <Card className="p-6 space-y-2 text-sm">
        <p><span className="text-gray-500">Block:</span> {unit.name ?? '—'}</p>
        <p><span className="text-gray-500">Type:</span> {unitTypeLabel}</p>
        <p><span className="text-gray-500">Rent:</span> {formatCurrency(unit.monthly_rent ?? 0)}</p>
      </Card>
    </div>
  )
}

export default function UnitDetailPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><UnitDetailInner /></RoleGate>
}
