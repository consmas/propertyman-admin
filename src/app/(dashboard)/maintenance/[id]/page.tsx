'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { maintenanceApi } from '@/lib/api/maintenance'
import { parseSingle } from '@/lib/jsonapi'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate, humanizeStatus } from '@/lib/utils'
import type { MaintenanceAttributes, MaintenanceStatus } from '@/types'

const STATUS_FLOW: MaintenanceStatus[] = ['open', 'in_progress', 'resolved', 'closed', 'cancelled']

export default function MaintenanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const propertyId = useCurrentPropertyId()
  const queryClient = useQueryClient()
  const [newStatus, setNewStatus] = useState<MaintenanceStatus | ''>('')
  const [statusNotes, setStatusNotes] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance-request', propertyId, id],
    queryFn: () => maintenanceApi.get(propertyId!, id),
    enabled: !!propertyId,
  })

  const statusMutation = useMutation({
    mutationFn: () => maintenanceApi.updateStatus(propertyId!, id, newStatus as MaintenanceStatus, statusNotes),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['maintenance-request', propertyId, id] })
      queryClient.invalidateQueries({ queryKey: ['maintenance', propertyId] })
      setNewStatus('')
      setStatusNotes('')
    },
    onError: () => toast.error('Failed to update status'),
  })

  const request = data ? parseSingle<MaintenanceAttributes>(data as never) : null

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!request) return null

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/maintenance">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title={request.title}
          description={humanizeStatus(request.category)}
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={request.priority} type="maintenance_priority" />
              <StatusBadge status={request.status} type="maintenance" />
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main details */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Request Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</p>
              <p className="mt-1 text-sm text-gray-900">{request.description}</p>
            </div>

            {request.notes && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</p>
                <p className="mt-1 text-sm text-gray-900">{request.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              {[
                { label: 'Reported Date', value: formatDate(request.reported_date) },
                { label: 'Resolved Date', value: formatDate(request.resolved_date) },
                { label: 'Assigned To', value: request.assigned_to ?? 'Unassigned' },
                { label: 'Estimated Cost', value: request.estimated_cost ? formatCurrency(request.estimated_cost) : '—' },
                { label: 'Actual Cost', value: request.actual_cost ? formatCurrency(request.actual_cost) : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="mt-1 text-sm text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status update */}
        <Card>
          <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>New Status</Label>
              <Select onValueChange={(v) => setNewStatus(v as MaintenanceStatus)} value={newStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status…" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FLOW.filter(s => s !== request.status).map(s => (
                    <SelectItem key={s} value={s}>{humanizeStatus(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Notes (optional)</Label>
              <textarea
                rows={3}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Update notes…"
              />
            </div>

            <Button
              className="w-full"
              disabled={!newStatus}
              loading={statusMutation.isPending}
              onClick={() => statusMutation.mutate()}
            >
              Update Status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
