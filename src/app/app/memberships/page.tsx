'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { propertyMembershipsEndpoints } from '@/lib/api/endpoints/property-memberships'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import type { ApiPropertyMembership } from '@/types/api'

const columns: Column<ApiPropertyMembership>[] = [
  { key: 'user_id', header: 'User', render: (row) => <span className="font-mono text-xs">{row.user_id}</span> },
  { key: 'property_id', header: 'Property', render: (row) => <span className="font-mono text-xs">{row.property_id}</span> },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status', render: (row) => row.status ?? 'active' },
]

function MembershipsInner() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['memberships', propertyId, page],
    queryFn: () => propertyMembershipsEndpoints.list({ property_id: propertyId ?? undefined, page, per_page: 20 }),
  })

  if (isError) return <ErrorState message="Failed to load memberships" onRetry={() => refetch()} />

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Property Memberships" description="Assign users to properties" actions={<Link href="/app/memberships/new"><Button><Plus className="h-4 w-4" />New Membership</Button></Link>} />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={data?.meta?.total ?? rows.length}
        page={page}
        perPage={20}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/app/memberships/${row.id}/edit`)}
        emptyMessage="No memberships found."
      />
    </div>
  )
}

export default function MembershipsPage() {
  return <RoleGate roles={['owner', 'admin']}><MembershipsInner /></RoleGate>
}
