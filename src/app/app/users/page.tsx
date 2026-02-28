'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { usersEndpoints } from '@/lib/api/endpoints/users'
import { useCanManageUsersMemberships } from '@/hooks/use-auth'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import type { ApiUser, UserRole } from '@/types/api'

const roleOptions: UserRole[] = ['owner', 'admin', 'property_manager', 'accountant', 'caretaker', 'tenant']

const columns: Column<ApiUser>[] = [
  {
    key: 'full_name',
    header: 'Name',
    render: (row) => (
      <div>
        <p className="font-medium text-gray-900">{row.full_name}</p>
        <p className="text-xs text-gray-500">{row.email}</p>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    render: (row) => <span className="capitalize">{row.role.replace(/_/g, ' ')}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => row.status ?? 'active',
  },
]

function UsersListPage() {
  const router = useRouter()
  const canManage = useCanManageUsersMemberships()
  const [role, setRole] = useState<UserRole | 'all'>('all')
  const [active, setActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', role, active, page],
    queryFn: () =>
      usersEndpoints.list({
        role: role === 'all' ? undefined : role,
        status: active === 'all' ? undefined : active,
        page,
        per_page: 20,
      }),
    enabled: canManage,
  })

  if (isError) {
    return <ErrorState onRetry={() => refetch()} message="Failed to load users" />
  }

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage platform users"
        actions={
          <Link href="/app/users/new">
            <Button><Plus className="h-4 w-4" />New User</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <select className="h-9 rounded-md border px-3 text-sm" value={role} onChange={(e) => setRole(e.target.value as UserRole | 'all')}>
          <option value="all">All roles</option>
          {roleOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select className="h-9 rounded-md border px-3 text-sm" value={active} onChange={(e) => setActive(e.target.value as 'all' | 'active' | 'inactive')}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={data?.meta?.total ?? rows.length}
        page={page}
        perPage={20}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/app/users/${row.id}`)}
        emptyMessage="No users found."
      />
    </div>
  )
}

export default function UsersPage() {
  return (
    <RoleGate roles={['owner', 'admin']}>
      <UsersListPage />
    </RoleGate>
  )
}
