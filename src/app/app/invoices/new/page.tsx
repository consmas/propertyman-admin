'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const schema = z.object({
  tenant_id: z.string().uuid().optional().or(z.literal('')),
  unit_id: z.string().uuid().optional().or(z.literal('')),
  lease_id: z.string().uuid().optional().or(z.literal('')),
  invoice_type: z.enum(['rent', 'water', 'electricity', 'service_charge', 'penalty', 'other']),
  issued_on: z.string().min(1),
  due_on: z.string().min(1),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function NewInvoiceInner() {
  const propertyId = useCurrentPropertyId()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { invoice_type: 'other' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: invoicesEndpoints.create,
    onSuccess: () => {
      toast.success('Invoice created')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      router.push('/app/invoices')
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  const onSubmit = (values: FormValues) => {
    if (!propertyId) return setError('root.server', { message: 'Select a property first' })
    mutate({
      invoice: {
        property_id: propertyId,
        tenant_id: values.tenant_id || undefined,
        unit_id: values.unit_id || undefined,
        lease_id: values.lease_id || undefined,
        invoice_type: values.invoice_type,
        issued_on: values.issued_on,
        due_on: values.due_on,
        notes: values.notes || undefined,
      },
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3"><Link href="/app/invoices"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><PageHeader title="New Invoice" description="Create invoice" /></div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card className="p-6 space-y-4">
          <input {...register('tenant_id')} placeholder="Tenant ID (optional)" className="h-9 w-full rounded-md border px-3 text-sm font-mono" />
          <input {...register('unit_id')} placeholder="Unit ID (optional)" className="h-9 w-full rounded-md border px-3 text-sm font-mono" />
          <input {...register('lease_id')} placeholder="Lease ID (optional)" className="h-9 w-full rounded-md border px-3 text-sm font-mono" />
          <select {...register('invoice_type')} className="h-9 w-full rounded-md border px-3 text-sm"><option value="rent">Rent</option><option value="water">Water</option><option value="electricity">Electricity</option><option value="service_charge">Service charge</option><option value="penalty">Penalty</option><option value="other">Other</option></select>
          <div className="grid grid-cols-2 gap-3"><input {...register('issued_on')} type="date" className="h-9 w-full rounded-md border px-3 text-sm" /><input {...register('due_on')} type="date" className="h-9 w-full rounded-md border px-3 text-sm" /></div>
          <textarea {...register('notes')} rows={3} placeholder="Notes" className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>
        <div className="flex justify-end gap-2"><Link href="/app/invoices"><Button type="button" variant="outline">Cancel</Button></Link><Button type="submit" loading={isPending}>Create Invoice</Button></div>
      </form>
    </div>
  )
}

export default function NewInvoicePage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'accountant']}><NewInvoiceInner /></RoleGate>
}
