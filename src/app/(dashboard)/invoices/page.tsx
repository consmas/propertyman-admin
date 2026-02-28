'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Droplets, Filter } from 'lucide-react'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { invoicesApi } from '@/lib/api/invoices'
import { parseList } from '@/lib/jsonapi'
import { useHasRole } from '@/hooks/use-auth'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate, humanizeStatus } from '@/lib/utils'
import type { InvoiceAttributes, InvoiceStatus, InvoiceType } from '@/types'

type InvoiceRow = InvoiceAttributes & { id: string }

const columns: Column<InvoiceRow>[] = [
  {
    key: 'invoice_number',
    header: 'Invoice #',
    render: (row) => <span className="font-mono text-sm font-medium">{row.invoice_number}</span>,
  },
  {
    key: 'type',
    header: 'Type',
    render: (row) => <span className="capitalize">{humanizeStatus(row.type)}</span>,
  },
  {
    key: 'due_date',
    header: 'Due Date',
    render: (row) => formatDate(row.due_date),
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (row) => <span className="font-medium">{formatCurrency(row.amount)}</span>,
  },
  {
    key: 'balance_due',
    header: 'Balance Due',
    render: (row) => {
      const bal = parseFloat(row.balance_due)
      return (
        <span className={bal > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>
          {bal > 0 ? formatCurrency(row.balance_due) : 'Paid'}
        </span>
      )
    },
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} type="invoice" />,
  },
]

export default function InvoicesPage() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const queryClient = useQueryClient()
  const canRunWaterBilling = useHasRole('owner', 'admin', 'accountant')

  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<InvoiceType | 'all'>('all')
  const [page, setPage] = useState(1)
  const [waterBillingOpen, setWaterBillingOpen] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', propertyId, statusFilter, typeFilter, page],
    queryFn: () =>
      invoicesApi.list(propertyId!, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        page,
        per_page: 25,
      }),
    enabled: !!propertyId,
  })

  const { data: rows, meta } = data
    ? parseList<InvoiceAttributes>(data as never)
    : { data: [], meta: {} }

  const waterBillingMutation = useMutation({
    mutationFn: () => invoicesApi.runWaterBilling(propertyId!, billingPeriod),
    onSuccess: () => {
      toast.success('Water billing run completed')
      queryClient.invalidateQueries({ queryKey: ['invoices', propertyId] })
      setWaterBillingOpen(false)
      setBillingPeriod('')
    },
    onError: () => toast.error('Failed to run water billing'),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage all invoices and billing"
        actions={
          canRunWaterBilling ? (
            <Button variant="outline" onClick={() => setWaterBillingOpen(true)}>
              <Droplets className="h-4 w-4" />
              Water Billing Run
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select onValueChange={(v) => { setStatusFilter(v as InvoiceStatus | 'all'); setPage(1) }} defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(['draft', 'issued', 'partial', 'paid', 'overdue', 'void'] as InvoiceStatus[]).map(s => (
              <SelectItem key={s} value={s}>{humanizeStatus(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => { setTypeFilter(v as InvoiceType | 'all'); setPage(1) }} defaultValue="all">
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {(['rent', 'water', 'electricity', 'service_charge', 'penalty', 'other'] as InvoiceType[]).map(t => (
              <SelectItem key={t} value={t}>{humanizeStatus(t)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={meta?.total ?? rows.length}
        page={page}
        perPage={25}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/dashboard/invoices/${r.id}`)}
        emptyMessage="No invoices found."
      />

      {/* Water Billing Dialog */}
      <Dialog open={waterBillingOpen} onOpenChange={setWaterBillingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Monthly Water Billing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              This will generate water invoices for all occupied units based on their meter readings for the selected billing period.
            </p>
            <Input
              label="Billing Period (e.g. 2025-01)"
              type="month"
              value={billingPeriod}
              onChange={(e) => setBillingPeriod(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWaterBillingOpen(false)}>Cancel</Button>
            <Button
              onClick={() => waterBillingMutation.mutate()}
              loading={waterBillingMutation.isPending}
              disabled={!billingPeriod}
            >
              Run Billing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
