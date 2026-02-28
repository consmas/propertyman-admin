'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar, DollarSign, FileText, AlertTriangle, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { leasesEndpoints } from '@/lib/api/endpoints/leases'
import { getErrorMessage } from '@/lib/errors'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { KpiCard } from '@/components/shared/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCents, formatDate } from '@/lib/utils'
import { useHasRole } from '@/hooks/use-auth'
import { ApiError } from '@/types'
import type { ApiLease } from '@/types/api'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 text-sm text-gray-900">{value ?? '—'}</div>
    </div>
  )
}

export default function LeaseDetailPage({
  params,
}: {
  params: Promise<{ leaseId: string }>
}) {
  const { leaseId } = use(params)
  const queryClient = useQueryClient()
  const router = useRouter()
  const [showTerminate, setShowTerminate] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const canDeleteLease = useHasRole('owner', 'admin')

  const { data, isLoading } = useQuery({
    queryKey: ['app-lease', leaseId],
    queryFn: () => leasesEndpoints.get(leaseId),
  })

  const lease: ApiLease | undefined = data?.data

  const { mutate: terminate, isPending: isTerminating } = useMutation({
    mutationFn: () => leasesEndpoints.terminate(leaseId),
    onSuccess: () => {
      toast.success('Lease terminated')
      queryClient.invalidateQueries({ queryKey: ['app-lease', leaseId] })
      queryClient.invalidateQueries({ queryKey: ['app-leases'] })
      setShowTerminate(false)
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to terminate lease'),
  })

  const { mutate: activate, isPending: isActivating } = useMutation({
    mutationFn: () => leasesEndpoints.update(leaseId, { lease: { status: 'active' } }),
    onSuccess: () => {
      toast.success('Lease activated')
      queryClient.invalidateQueries({ queryKey: ['app-lease', leaseId] })
      queryClient.invalidateQueries({ queryKey: ['app-leases'] })
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to activate lease'),
  })

  const { mutate: deleteLease, isPending: isDeleting } = useMutation({
    mutationFn: () => leasesEndpoints.delete(leaseId),
    onSuccess: () => {
      toast.success('Lease deleted successfully.')
      queryClient.invalidateQueries({ queryKey: ['app-lease', leaseId] })
      queryClient.invalidateQueries({ queryKey: ['app-leases'] })
      queryClient.invalidateQueries({ queryKey: ['properties', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['units', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['payments', 'dashboard'] })
      setShowDelete(false)
      router.push('/app/leases')
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 404) {
        toast.info('Lease was already removed. Refreshing list.')
        queryClient.invalidateQueries({ queryKey: ['app-leases'] })
        router.push('/app/leases')
        return
      }
      toast.error(getErrorMessage(error, 'Failed to delete lease'))
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!lease) return null

  const isActive = lease.status === 'active'
  const isPending = lease.status === 'pending'
  const canTerminate = isActive || isPending

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/app/leases">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title="Lease Agreement"
          description={`ID: ${leaseId}`}
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={lease.status} type="lease" />
              <Link href={`/app/leases/${leaseId}/edit`}>
                <Button size="sm" variant="outline">Edit Lease</Button>
              </Link>
              {isPending && (
                <Button
                  size="sm"
                  onClick={() => activate()}
                  loading={isActivating}
                >
                  Activate
                </Button>
              )}
              {canTerminate && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowTerminate(true)}
                >
                  Terminate
                </Button>
              )}
              {canDeleteLease && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Terminate confirm */}
      {showTerminate && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Terminate this lease?</p>
              <p className="text-xs text-red-600 mt-0.5">This action cannot be undone.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowTerminate(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => terminate()}
                loading={isTerminating}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showDelete} onOpenChange={(open) => !isDeleting && setShowDelete(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lease?</DialogTitle>
            <DialogDescription>
              This removes the lease and its linked lease-generated records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteLease()} loading={isDeleting} disabled={isDeleting}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Monthly Rent"
          value={formatCents(lease.rent_cents)}
          icon={DollarSign}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <KpiCard
          title="Security Deposit"
          value={formatCents(lease.security_deposit_cents)}
          icon={DollarSign}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          title="Plan"
          value={`${lease.plan_months} months`}
          icon={Calendar}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Details */}
      <Card>
        <CardHeader><CardTitle>Lease Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <DetailRow label="Unit ID" value={<span className="font-mono text-xs">{lease.unit_id}</span>} />
          <DetailRow label="Tenant ID" value={<span className="font-mono text-xs">{lease.tenant_id}</span>} />
          <DetailRow label="Start Date" value={formatDate(lease.start_date)} />
          <DetailRow label="End Date" value={formatDate(lease.end_date)} />
          <DetailRow
            label="Paid Through"
            value={
              lease.paid_through_date
                ? <span className="text-green-700 font-medium">{formatDate(lease.paid_through_date)}</span>
                : <span className="text-gray-400">Not yet paid</span>
            }
          />
          <DetailRow label="Created" value={formatDate(lease.created_at)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" />IDs</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <DetailRow label="Lease ID" value={<span className="font-mono text-xs">{lease.id}</span>} />
          <DetailRow label="Property ID" value={<span className="font-mono text-xs">{lease.property_id}</span>} />
        </CardContent>
      </Card>
    </div>
  )
}
