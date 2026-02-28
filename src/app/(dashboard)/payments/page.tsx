'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, CreditCard, CheckCircle } from 'lucide-react'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { paymentsApi } from '@/lib/api/payments'
import { tenantsApi } from '@/lib/api/tenants'
import { parseList } from '@/lib/jsonapi'
import { recordPaymentSchema, type RecordPaymentFormValues } from '@/lib/validations/payment'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, humanizeStatus } from '@/lib/utils'
import type { PaymentAttributes, TenantAttributes } from '@/types'

type PaymentRow = PaymentAttributes & { id: string }

const columns: Column<PaymentRow>[] = [
  {
    key: 'payment_number',
    header: 'Reference',
    render: (row) => <span className="font-mono text-sm font-medium">{row.payment_number}</span>,
  },
  {
    key: 'payment_date',
    header: 'Date',
    render: (row) => formatDate(row.payment_date),
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (row) => <span className="font-semibold text-emerald-700">{formatCurrency(row.amount)}</span>,
  },
  {
    key: 'payment_method',
    header: 'Method',
    render: (row) => <Badge variant="gray">{humanizeStatus(row.payment_method)}</Badge>,
  },
  {
    key: 'unallocated_balance',
    header: 'Unallocated',
    render: (row) => {
      const bal = parseFloat(row.unallocated_balance)
      return bal > 0 ? (
        <span className="text-amber-600 font-medium">{formatCurrency(row.unallocated_balance)}</span>
      ) : (
        <span className="flex items-center gap-1 text-emerald-600 text-xs">
          <CheckCircle className="h-3.5 w-3.5" />Fully allocated
        </span>
      )
    },
  },
  {
    key: 'allocations',
    header: 'Allocations',
    render: (row) => (
      <span className="text-gray-500">{row.allocations.length} invoice{row.allocations.length !== 1 ? 's' : ''}</span>
    ),
  },
]

export default function PaymentsPage() {
  const propertyId = useCurrentPropertyId()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['payments', propertyId, page],
    queryFn: () => paymentsApi.list(propertyId!, { page, per_page: 25 }),
    enabled: !!propertyId,
  })

  const { data: tenantsData } = useQuery({
    queryKey: ['tenants', propertyId],
    queryFn: () => tenantsApi.list(propertyId!, { per_page: 100 }),
    enabled: !!propertyId,
  })

  const tenants = tenantsData ? parseList<TenantAttributes>(tenantsData as never).data : []
  const { data: rows, meta } = data
    ? parseList<PaymentAttributes>(data as never)
    : { data: [], meta: {} }

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      payment_date: new Date().toISOString().split('T')[0],
    },
  })

  const mutation = useMutation({
    mutationFn: (values: RecordPaymentFormValues) =>
      paymentsApi.create(propertyId!, { ...values, property_id: propertyId! }),
    onSuccess: (response) => {
      const payment = response.data as { attributes: PaymentAttributes }
      const unallocated = parseFloat(payment.attributes?.unallocated_balance ?? '0')
      if (unallocated > 0) {
        toast.success(`Payment recorded. ${formatCurrency(unallocated)} unallocated balance.`)
      } else {
        toast.success('Payment recorded and fully allocated to invoices.')
      }
      queryClient.invalidateQueries({ queryKey: ['payments', propertyId] })
      queryClient.invalidateQueries({ queryKey: ['invoices', propertyId] })
      setOpen(false)
      reset()
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to record payment')
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Record and track all tenant payments"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={meta?.total ?? rows.length}
        page={page}
        perPage={25}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        emptyMessage="No payments recorded yet."
      />

      {/* Record Payment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              Record Payment
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-4 py-2">
            {/* Tenant */}
            <div className="space-y-1">
              <Label>Tenant</Label>
              <Select onValueChange={(v) => setValue('tenant_id', v)}>
                <SelectTrigger error={errors.tenant_id?.message}>
                  <SelectValue placeholder="Select tenant…" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.first_name} {t.last_name}
                      {parseFloat(t.outstanding_balance) > 0 && (
                        <span className="text-red-500 ml-1">· Owes {formatCurrency(t.outstanding_balance)}</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tenant_id && <p className="text-xs text-red-600">{errors.tenant_id.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Amount (GHS)"
                type="number"
                min={1}
                step={100}
                {...register('amount')}
                error={errors.amount?.message}
              />
              <Input
                label="Payment Date"
                type="date"
                {...register('payment_date')}
                error={errors.payment_date?.message}
              />
            </div>

            <div className="space-y-1">
              <Label>Payment Method</Label>
              <Select onValueChange={(v) => setValue('payment_method', v as RecordPaymentFormValues['payment_method'])}>
                <SelectTrigger error={errors.payment_method?.message}>
                  <SelectValue placeholder="Select method…" />
                </SelectTrigger>
                <SelectContent>
                  {(['cash', 'bank_transfer', 'mobile_money', 'cheque', 'card'] as const).map(m => (
                    <SelectItem key={m} value={m}>{humanizeStatus(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.payment_method && <p className="text-xs text-red-600">{errors.payment_method.message}</p>}
            </div>

            <Input
              label="Reference Number (optional)"
              {...register('reference_number')}
              placeholder="e.g. M-PESA code, bank ref"
            />

            <Input
              label="Notes (optional)"
              {...register('notes')}
              placeholder="Any additional notes"
            />

            <div className="rounded-lg bg-indigo-50 p-3 text-xs text-indigo-700">
              Payment will be automatically allocated to the oldest unpaid invoices for this tenant.
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); reset() }}>Cancel</Button>
            <Button onClick={handleSubmit(v => mutation.mutate(v))} loading={mutation.isPending}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
