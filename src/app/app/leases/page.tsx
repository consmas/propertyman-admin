'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { useHasRole } from '@/hooks/use-auth'
import { leasesEndpoints } from '@/lib/api/endpoints/leases'
import { getErrorMessage } from '@/lib/errors'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCents, formatDate } from '@/lib/utils'
import { ApiError } from '@/types'
import type { ApiLease } from '@/types/api'

export default function AppLeasesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const propertyId = useCurrentPropertyId()
  const canDeleteLease = useHasRole('owner', 'admin')
  const [page, setPage] = useState(1)
  const [targetLease, setTargetLease] = useState<ApiLease | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['app-leases', propertyId, page],
    queryFn: () => leasesEndpoints.list({ property_id: propertyId ?? undefined, page, per_page: 25 }),
    enabled: !!propertyId,
  })

  const deleteLease = useMutation({
    mutationFn: (leaseId: string) => leasesEndpoints.delete(leaseId),
    onSuccess: () => {
      toast.success('Lease deleted successfully.')
      queryClient.invalidateQueries({ queryKey: ['app-leases'] })
      queryClient.invalidateQueries({ queryKey: ['properties', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['units', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['payments', 'dashboard'] })
      setTargetLease(null)
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.status === 404) {
        toast.info('Lease was already removed. Refreshing list.')
        queryClient.invalidateQueries({ queryKey: ['app-leases'] })
        setTargetLease(null)
        return
      }
      toast.error(getErrorMessage(error, 'Failed to delete lease'))
    },
  })

  const columns: Column<ApiLease>[] = [
    {
      key: 'unit_id',
      header: 'Unit',
      render: (row) => <span className="font-mono text-xs text-gray-500">{row.unit_id.slice(0, 8)}…</span>,
    },
    {
      key: 'tenant_id',
      header: 'Tenant',
      render: (row) => <span className="font-mono text-xs text-gray-500">{row.tenant_id.slice(0, 8)}…</span>,
    },
    {
      key: 'start_date',
      header: 'Period',
      render: (row) => (
        <div>
          <p className="text-sm">{formatDate(row.start_date)} → {formatDate(row.end_date)}</p>
          <p className="text-xs text-gray-500">{row.plan_months} months</p>
        </div>
      ),
    },
    {
      key: 'rent_cents',
      header: 'Monthly Rent',
      render: (row) => <span className="font-medium">{formatCents(row.rent_cents)}</span>,
    },
    {
      key: 'paid_through_date',
      header: 'Paid Through',
      render: (row) => (
        <span className={row.paid_through_date ? 'text-gray-900' : 'text-gray-400'}>
          {formatDate(row.paid_through_date)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} type="lease" />,
    },
  ]

  if (canDeleteLease) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          size="sm"
          variant="destructive"
          onClick={(event) => {
            event.stopPropagation()
            setTargetLease(row)
          }}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      ),
      className: 'w-32',
      headerClassName: 'w-32',
    })
  }

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leases"
        description="All lease agreements"
        actions={
          <Link href="/app/leases/new">
            <Button><Plus className="h-4 w-4" />New Lease</Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={data?.meta?.total ?? rows.length}
        page={page}
        perPage={25}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/app/leases/${r.id}`)}
        searchable
        emptyMessage="No leases found. Create one to get started."
      />

      <Dialog open={Boolean(targetLease)} onOpenChange={(open) => !deleteLease.isPending && !open && setTargetLease(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lease?</DialogTitle>
            <DialogDescription>
              This removes the lease and its linked lease-generated records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTargetLease(null)} disabled={deleteLease.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => targetLease && deleteLease.mutate(targetLease.id)}
              loading={deleteLease.isPending}
              disabled={deleteLease.isPending}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
