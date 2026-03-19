'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { tenantsEndpoints } from '@/lib/api/endpoints/tenants'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { RoleGate } from '@/components/shared/role-gate'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, getInitials } from '@/lib/utils'
import type { ApiTenant } from '@/types/api'

const STATUS_VARIANT: Record<ApiTenant['status'], 'success' | 'gray' | 'danger'> = {
  active: 'success',
  inactive: 'gray',
  archived: 'danger',
}

const columns: Column<ApiTenant>[] = [
  {
    key: 'full_name',
    header: 'Tenant',
    render: (row) => {
      const name = row.full_name ?? `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim()
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-[11px] font-bold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">{name}</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">{row.email}</p>
          </div>
        </div>
      )
    },
  },
  {
    key: 'phone',
    header: 'Phone',
    render: (row) => (
      <span className="text-[var(--text-secondary)]">{row.phone || '—'}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={STATUS_VARIANT[row.status] ?? 'gray'}>{row.status}</Badge>
    ),
  },
  {
    key: 'outstanding',
    header: 'Outstanding',
    render: (row) => (
      <span
        className="font-display font-bold"
        style={{ color: row.outstanding > 0 ? 'var(--error-500)' : 'var(--success-500)' }}
      >
        {formatCurrency(row.outstanding)}
      </span>
    ),
  },
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

  if (!propertyId)
    return (
      <ErrorState
        title="No property selected"
        message="Select a property from the sidebar to view its tenants."
      />
    )
  if (isError) return <ErrorState message="Failed to load tenants" onRetry={() => refetch()} />

  const rows = data?.data ?? []

  return (
    <div className="fade-up space-y-6">
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={data?.meta?.total ?? rows.length}
        page={page}
        perPage={20}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/app/tenants/${row.id}`)}
        emptyMessage="No tenants found for this property."
        searchable
        actions={
          <Link href="/app/tenants/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Tenant
            </Button>
          </Link>
        }
      />
    </div>
  )
}

export default function TenantsPage() {
  return (
    <RoleGate roles={['owner', 'admin', 'property_manager']}>
      <TenantsInner />
    </RoleGate>
  )
}
