'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { auditLogsEndpoints } from '@/lib/api/endpoints/audit-logs'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { PageLoader } from '@/components/shared/loading-spinner'
import { ErrorState } from '@/components/shared/error-state'
import { formatDate } from '@/lib/utils'

function AuditLogDetailInner() {
  const params = useParams<{ id: string }>()
  const query = useQuery({ queryKey: ['audit_logs', params.id], queryFn: () => auditLogsEndpoints.get(params.id) })
  if (query.isLoading) return <PageLoader />
  if (query.isError || !query.data?.data) return <ErrorState message="Failed to load audit log" onRetry={() => query.refetch()} />

  const row = query.data.data

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description={row.action} />
      <Card className="p-6 space-y-2 text-sm">
        <p>Action: {row.action}</p>
        <p>Actor: {row.actor_name ?? row.actor_id ?? 'System'}</p>
        <p>Entity: {row.entity_type ?? '—'} {row.entity_id ?? ''}</p>
        <p>Created: {formatDate(row.created_at, 'MMM d, yyyy HH:mm')}</p>
        <pre className="overflow-auto rounded bg-gray-100 p-3 text-xs">{JSON.stringify(row.metadata ?? {}, null, 2)}</pre>
      </Card>
    </div>
  )
}

export default function AuditLogDetailPage() {
  return <RoleGate roles={['owner', 'admin', 'accountant']}><AuditLogDetailInner /></RoleGate>
}
