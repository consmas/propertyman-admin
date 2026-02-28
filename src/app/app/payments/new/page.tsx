'use client'

import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { paymentsEndpoints } from '@/lib/api/endpoints/payments'
import { tenantsEndpoints } from '@/lib/api/endpoints/tenants'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toCents } from '@/lib/utils'
import type { PaymentMethod } from '@/types/api'

const schema = z.object({
  tenant_id: z.string().uuid('Must be a valid UUID'),
  reference: z.string().min(1, 'Required').max(100),
  payment_method: z.enum(['cash', 'bank_transfer', 'mobile_money', 'cheque', 'card']),
  amount_ghs: z.coerce.number().positive('Must be positive'),
  paid_at: z.string().min(1, 'Required'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'card', label: 'Card' },
]

export default function NewPaymentPage() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      payment_method: 'bank_transfer',
      paid_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  })
  const tenantId = watch('tenant_id')

  const tenantsQuery = useQuery({
    queryKey: ['payment-form-tenants', propertyId],
    queryFn: () => tenantsEndpoints.list({ property_id: propertyId ?? undefined, per_page: 200 }),
    enabled: Boolean(propertyId),
  })

  const openInvoicesQuery = useQuery({
    queryKey: ['payment-form-open-invoices', propertyId, tenantId],
    queryFn: () => invoicesEndpoints.list({
      property_id: propertyId ?? undefined,
      tenant_id: tenantId || undefined,
      per_page: 200,
    }),
    enabled: Boolean(propertyId && tenantId),
  })

  const openInvoices = (openInvoicesQuery.data?.data ?? []).filter((inv) =>
    ['issued', 'partial', 'overdue'].includes(inv.status) && inv.balance_cents > 0
  )
  const openInvoiceCount = openInvoices.length

  const { mutate, isPending } = useMutation({
    mutationFn: paymentsEndpoints.create,
    onSuccess: () => {
      toast.success('Payment recorded successfully')
      queryClient.invalidateQueries({ queryKey: ['app-payments'] })
      router.push('/app/payments')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to record payment')
    },
  })

  const onSubmit = (values: FormValues) => {
    if (!propertyId) {
      toast.error('No property selected')
      return
    }
    mutate({
      payment: {
        property_id: propertyId,
        tenant_id: values.tenant_id,
        reference: values.reference,
        payment_method: values.payment_method,
        amount_cents: toCents(values.amount_ghs),
        paid_at: new Date(values.paid_at).toISOString(),
        notes: values.notes || undefined,
      },
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/app/payments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title="Record Payment" description="Log a tenant payment and auto-allocate to invoices" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Payment Details</h2>

          {/* Tenant */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Tenant</label>
            <Controller
              name="tenant_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {(tenantsQuery.data?.data ?? []).map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {(tenant.full_name ?? `${tenant.first_name ?? ''} ${tenant.last_name ?? ''}`.trim()) || tenant.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tenant_id && <p className="text-xs text-red-600">{errors.tenant_id.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Reference */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Reference</label>
              <input
                {...register('reference')}
                placeholder="e.g. TXN-20260226-001"
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.reference && <p className="text-xs text-red-600">{errors.reference.message}</p>}
            </div>

            {/* Method */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <Controller
                name="payment_method"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Amount (GHS)</label>
              <input
                {...register('amount_ghs')}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.amount_ghs && <p className="text-xs text-red-600">{errors.amount_ghs.message}</p>}
            </div>

            {/* Paid At */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Paid At</label>
              <input
                {...register('paid_at')}
                type="datetime-local"
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.paid_at && <p className="text-xs text-red-600">{errors.paid_at.message}</p>}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Notes <span className="text-gray-400">(optional)</span></label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Any additional notes…"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </Card>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          <p>
            Backend allocates to the tenant&apos;s oldest unpaid invoices first.
            Any excess remains in <code>payment.unallocated_cents</code>.
          </p>
          <p className="mt-1">
            For full-term lease payments, when the term invoice/installment is fully covered,
            lease <code>paid_through_date</code> moves to lease <code>end_date</code>.
          </p>
          {tenantId && openInvoicesQuery.isSuccess && (
            <p className="mt-1">
              {openInvoiceCount > 0
                ? `Open invoices found: ${openInvoiceCount}.`
                : 'No open invoices found for this tenant yet; payment may remain fully unallocated.'}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/app/payments">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" loading={isPending}>
            Record Payment
          </Button>
        </div>
      </form>
    </div>
  )
}
