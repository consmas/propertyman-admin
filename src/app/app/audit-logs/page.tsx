'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { auditLogsEndpoints } from '@/lib/api/endpoints/audit-logs'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { ErrorState } from '@/components/shared/error-state'
import { formatDate } from '@/lib/utils'
import type { ApiAuditLog } from '@/types/api'

const columns: Column<ApiAuditLog>[] = [
  { key: 'action', header: 'Action' },
  { key: 'actor_name', header: 'Actor', render: (r) => r.actor_name ?? 'System' },
  { key: 'entity_type', header: 'Entity', render: (r) => r.entity_type ?? '—' },
  { key: 'created_at', header: 'When', render: (r) => formatDate(r.created_at, 'MMM d, yyyy HH:mm') },
]

function AuditLogsInner() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const [action, setAction] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['audit_logs', propertyId, action],
    queryFn: () => auditLogsEndpoints.list({ property_id: propertyId ?? undefined, action: action || undefined, per_page: 50 }),
  })

  if (isError) return <ErrorState message="Failed to load audit logs" onRetry={() => refetch()} />
  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Track important actions" />
      <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Filter by action" className="h-9 rounded-md border px-3 text-sm" />
      <DataTable columns={columns} data={rows} isLoading={isLoading} total={data?.meta?.total ?? rows.length} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/app/audit-logs/${r.id}`)} emptyMessage="No audit logs found." />
    </div>
  )
}

export default function AuditLogsPage() {
  return <RoleGate roles={['owner', 'admin', 'accountant']}><AuditLogsInner /></RoleGate>
}
