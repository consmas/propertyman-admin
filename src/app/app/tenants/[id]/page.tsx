'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { tenantsEndpoints } from '@/lib/api/endpoints/tenants'
import { leasesEndpoints } from '@/lib/api/endpoints/leases'
import { unitsEndpoints } from '@/lib/api/endpoints/units'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { formatCents } from '@/lib/utils'

function TenantDetailInner() {
  const params = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['tenants', params.id], queryFn: () => tenantsEndpoints.get(params.id) })
  const leasesQ = useQuery({
    queryKey: ['leases', 'tenant-detail', params.id],
    queryFn: () => leasesEndpoints.list({ tenant_id: params.id, status: 'active', per_page: 20 }),
    enabled: Boolean(params.id),
  })
  const activeLease = (leasesQ.data?.data ?? [])[0]
  const assignedUnitQ = useQuery({
    queryKey: ['units', 'tenant-detail', activeLease?.unit_id],
    queryFn: () => unitsEndpoints.get(activeLease!.unit_id),
    enabled: Boolean(activeLease?.unit_id),
  })

  if (isLoading) return <PageLoader />
  if (isError || !data?.data) return <ErrorState message="Failed to load tenant" onRetry={() => refetch()} />

  const tenant = data.data
  const assignedUnit = assignedUnitQ.data?.data

  return (
    <div className="space-y-6">
      <PageHeader title={tenant.full_name ?? `${tenant.first_name} ${tenant.last_name}`} description={tenant.email} actions={<Link href={`/app/tenants/${tenant.id}/edit`}><Button>Edit</Button></Link>} />
      <Card className="p-6 space-y-2 text-sm">
        <p><span className="text-gray-500">Phone:</span> {tenant.phone}</p>
        <p>
          <span className="text-gray-500">Assigned Unit:</span>{' '}
          {assignedUnit ? `${assignedUnit.unit_number}${assignedUnit.name ? ` - ${assignedUnit.name}` : ''}` : 'Unassigned'}
        </p>
        <p><span className="text-gray-500">Status:</span> {tenant.status}</p>
        <p><span className="text-gray-500">Outstanding:</span> {formatCents(tenant.outstanding_cents)}</p>
      </Card>
    </div>
  )
}

export default function TenantDetailPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager']}><TenantDetailInner /></RoleGate>
}
