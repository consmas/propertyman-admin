'use client'

import { use } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { leasesApi } from '@/lib/api/leases'
import { parseSingle } from '@/lib/jsonapi'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { LeaseAttributes, RentInstallment } from '@/types'

export default function LeaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const propertyId = useCurrentPropertyId()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['lease', propertyId, id],
    queryFn: () => leasesApi.get(propertyId!, id),
    enabled: !!propertyId,
  })

  const { data: installments } = useQuery({
    queryKey: ['lease-installments', propertyId, id],
    queryFn: () => leasesApi.getInstallments(propertyId!, id),
    enabled: !!propertyId,
  })

  const terminateMutation = useMutation({
    mutationFn: () => leasesApi.terminate(propertyId!, id, 'Manually terminated'),
    onSuccess: () => {
      toast.success('Lease terminated')
      queryClient.invalidateQueries({ queryKey: ['lease', propertyId, id] })
    },
    onError: () => toast.error('Failed to terminate lease'),
  })

  const lease = data ? parseSingle<LeaseAttributes>(data as never) : null

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!lease) return null

  const installmentStatusMap: Record<RentInstallment['status'], 'success' | 'danger' | 'gray'> = {
    paid: 'success',
    overdue: 'danger',
    pending: 'gray',
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/leases">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title="Lease Agreement"
          description={`${lease.duration_months}-month lease`}
          actions={<StatusBadge status={lease.status} type="lease" />}
        />
      </div>

      <Card>
        <CardHeader><CardTitle>Lease Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: 'Start Date', value: formatDate(lease.start_date) },
            { label: 'End Date', value: formatDate(lease.end_date) },
            { label: 'Monthly Rent', value: formatCurrency(lease.monthly_rent) },
            { label: 'Security Deposit', value: formatCurrency(lease.security_deposit) },
            { label: 'Paid Through', value: lease.paid_through_date ? formatDate(lease.paid_through_date) : 'Not paid' },
            { label: 'Duration', value: `${lease.duration_months} months` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Installment schedule */}
      {installments && installments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Rent Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {installments.map((inst) => (
                <div key={inst.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatDate(inst.due_date, 'MMM yyyy')}</p>
                    <p className="text-xs text-gray-500">Due: {formatDate(inst.due_date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatCurrency(inst.amount)}</span>
                    <Badge variant={installmentStatusMap[inst.status]}>{inst.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger zone */}
      {lease.status === 'active' && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Terminate Lease</p>
                <p className="text-xs text-gray-500">This action cannot be undone. The unit will become vacant.</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                loading={terminateMutation.isPending}
                onClick={() => {
                  if (confirm('Are you sure you want to terminate this lease?')) {
                    terminateMutation.mutate()
                  }
                }}
              >
                Terminate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
