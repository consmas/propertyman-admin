'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'

const schema = z.object({
  status: z.enum(['draft', 'issued', 'partial', 'paid', 'overdue', 'void']),
  due_on: z.string().min(1),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function toDateInputValue(value?: string): string {
  if (!value) return ''
  return value.includes('T') ? value.split('T')[0] : value
}

function InvoiceEditInner() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const invoiceQuery = useQuery({ queryKey: ['invoices', params.id], queryFn: () => invoicesEndpoints.get(params.id) })

  useEffect(() => {
    if (invoiceQuery.data?.data) {
      reset({
        status: invoiceQuery.data.data.status,
        due_on: toDateInputValue(invoiceQuery.data.data.due_on),
        notes: invoiceQuery.data.data.notes ?? '',
      })
    }
  }, [invoiceQuery.data, reset])

  const update = useMutation({
    mutationFn: (values: FormValues) =>
      invoicesEndpoints.update(params.id, {
        invoice: {
          status: values.status,
          due_on: values.due_on,
          notes: values.notes || undefined,
        },
      }),
    onSuccess: () => {
      toast.success('Invoice updated')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', params.id] })
      router.push(`/app/invoices/${params.id}`)
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  if (invoiceQuery.isLoading) return <PageLoader />
  if (invoiceQuery.isError || !invoiceQuery.data?.data) return <ErrorState message="Failed to load invoice" onRetry={() => invoiceQuery.refetch()} />

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3"><Link href={`/app/invoices/${params.id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><PageHeader title="Edit Invoice" description={invoiceQuery.data.data.invoice_number} /></div>
      <form onSubmit={handleSubmit((values) => update.mutate(values))} className="space-y-4">
        <Card className="p-6 space-y-4">
          <select {...register('status')} className="h-9 w-full rounded-md border px-3 text-sm"><option value="draft">Draft</option><option value="issued">Issued</option><option value="partial">Partial</option><option value="paid">Paid</option><option value="overdue">Overdue</option><option value="void">Void</option></select>
          <input {...register('due_on')} type="date" className="h-9 w-full rounded-md border px-3 text-sm" />
          <textarea {...register('notes')} rows={3} className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.due_on && <p className="text-sm text-red-600">{errors.due_on.message}</p>}
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>
        <div className="flex justify-end gap-2"><Link href={`/app/invoices/${params.id}`}><Button type="button" variant="outline">Cancel</Button></Link><Button type="submit" loading={update.isPending}>Save</Button></div>
      </form>
    </div>
  )
}

export default function EditInvoicePage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'accountant']}><InvoiceEditInner /></RoleGate>
}
