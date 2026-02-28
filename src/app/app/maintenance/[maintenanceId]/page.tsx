'use client'

import { use } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Clock, DollarSign, Wrench } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { maintenanceEndpoints } from '@/lib/api/endpoints/maintenance'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { KpiCard } from '@/components/shared/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCents, formatDate, formatRelativeDate, humanizeStatus } from '@/lib/utils'
import type { ApiMaintenanceRequest, MaintenanceStatus } from '@/types/api'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 text-sm text-gray-900">{value ?? '—'}</div>
    </div>
  )
}

const STATUS_TRANSITIONS: { status: MaintenanceStatus; label: string; variant: 'default' | 'outline' | 'destructive' }[] = [
  { status: 'in_progress', label: 'Mark In Progress', variant: 'default' },
  { status: 'resolved', label: 'Mark Resolved', variant: 'outline' },
  { status: 'closed', label: 'Close', variant: 'outline' },
  { status: 'cancelled', label: 'Cancel', variant: 'destructive' },
]

export default function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ maintenanceId: string }>
}) {
  const { maintenanceId } = use(params)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['app-maintenance-item', maintenanceId],
    queryFn: () => maintenanceEndpoints.get(maintenanceId),
  })

  const request: ApiMaintenanceRequest | undefined = data?.data

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (status: MaintenanceStatus) =>
      maintenanceEndpoints.updateStatus(maintenanceId, status),
    onSuccess: (res) => {
      const newStatus = res.data?.status
      toast.success(`Status updated to ${humanizeStatus(newStatus)}`)
      queryClient.invalidateQueries({ queryKey: ['app-maintenance-item', maintenanceId] })
      queryClient.invalidateQueries({ queryKey: ['app-maintenance'] })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update status'),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!request) return null

  const isTerminal = ['resolved', 'closed', 'cancelled'].includes(request.status)

  const availableTransitions = STATUS_TRANSITIONS.filter(t => t.status !== request.status)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/app/maintenance">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title={request.title}
          description={`Requested ${formatRelativeDate(request.requested_at)}`}
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={request.priority} type="maintenance_priority" />
              <StatusBadge status={request.status} type="maintenance" />
            </div>
          }
        />
      </div>

      {/* Status actions */}
      {!isTerminal && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <span className="text-xs font-medium text-gray-500 mr-1">Update status:</span>
          {availableTransitions.map(t => (
            <Button
              key={t.status}
              size="sm"
              variant={t.variant}
              onClick={() => updateStatus(t.status)}
              loading={isPending}
            >
              {t.label}
            </Button>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Requested"
          value={formatDate(request.requested_at)}
          subtitle={formatRelativeDate(request.requested_at)}
          icon={Clock}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          title="Estimated Cost"
          value={request.estimated_cost_cents != null ? formatCents(request.estimated_cost_cents) : '—'}
          icon={DollarSign}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <KpiCard
          title="Actual Cost"
          value={request.actual_cost_cents != null ? formatCents(request.actual_cost_cents) : '—'}
          icon={DollarSign}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      {/* Description */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-4 w-4" />Description</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.description}</p>
          {request.notes && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <DetailRow label="Unit ID" value={<span className="font-mono text-xs">{request.unit_id}</span>} />
          <DetailRow
            label="Tenant ID"
            value={request.tenant_id ? <span className="font-mono text-xs">{request.tenant_id}</span> : null}
          />
          <DetailRow
            label="Assigned To"
            value={request.assigned_to ?? null}
          />
          <DetailRow
            label="Resolved At"
            value={request.resolved_at ? formatDate(request.resolved_at) : null}
          />
          <DetailRow label="Requested At" value={formatDate(request.requested_at)} />
          <DetailRow label="Last Updated" value={formatDate(request.updated_at)} />
        </CardContent>
      </Card>
    </div>
  )
}
