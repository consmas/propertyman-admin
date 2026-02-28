'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { tenantsEndpoints } from '@/lib/api/endpoints/tenants'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { formatCents } from '@/lib/utils'
import type { ApiTenant } from '@/types/api'

const columns: Column<ApiTenant>[] = [
  { key: 'name', header: 'Name', render: (row) => row.full_name ?? `${row.first_name} ${row.last_name}` },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'status', header: 'Status' },
  { key: 'outstanding_cents', header: 'Outstanding', render: (row) => formatCents(row.outstanding_cents) },
]

function TenantsInner() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tenants', propertyId, page],
    queryFn: () => tenantsEndpoints.list({ property_id: propertyId ?? undefined, page, per_page: 20 }),
    enabled: Boolean(propertyId),
  })

  if (!propertyId) return <ErrorState title="No property selected" message="Select a property to view tenants." />
  if (isError) return <ErrorState message="Failed to load tenants" onRetry={() => refetch()} />

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Tenants" description="Tenants for selected property" actions={<Link href="/app/tenants/new"><Button><Plus className="h-4 w-4" />New Tenant</Button></Link>} />
      <DataTable columns={columns} data={rows} isLoading={isLoading} total={data?.meta?.total ?? rows.length} page={page} perPage={20} onPageChange={setPage} rowKey={(row) => row.id} onRowClick={(row) => router.push(`/app/tenants/${row.id}`)} emptyMessage="No tenants found." />
    </div>
  )
}

export default function TenantsPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager']}><TenantsInner /></RoleGate>
}
