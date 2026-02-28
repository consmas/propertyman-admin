'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { User, Plus } from 'lucide-react'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { tenantsApi } from '@/lib/api/tenants'
import { parseList } from '@/lib/jsonapi'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCurrency, getInitials } from '@/lib/utils'
import type { TenantAttributes } from '@/types'

type TenantRow = TenantAttributes & { id: string }

const columns: Column<TenantRow>[] = [
  {
    key: 'name',
    header: 'Tenant',
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getInitials(row.first_name, row.last_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-gray-900">{row.first_name} {row.last_name}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'phone',
    header: 'Phone',
  },
  {
    key: 'outstanding_balance',
    header: 'Balance Due',
    render: (row) => {
      const balance = parseFloat(row.outstanding_balance)
      return (
        <span className={balance > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
          {balance > 0 ? formatCurrency(row.outstanding_balance) : '—'}
        </span>
      )
    },
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} type="tenant" />,
  },
]

export default function TenantsPage() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()

  const { data, isLoading } = useQuery({
    queryKey: ['tenants', propertyId],
    queryFn: () => tenantsApi.list(propertyId!, { per_page: 50 }),
    enabled: !!propertyId,
  })

  const { data: rows, meta } = data
    ? parseList<TenantAttributes>(data as never)
    : { data: [], meta: {} }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenants"
        description="All tenants in the selected property"
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Add Tenant
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={meta?.total ?? rows.length}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/dashboard/tenants/${r.id}`)}
        searchable
        searchPlaceholder="Search tenants…"
        emptyMessage="No tenants found for this property."
      />
    </div>
  )
}
