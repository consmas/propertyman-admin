'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { pumpTopupsEndpoints } from '@/lib/api/endpoints/pump-topups'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toCents } from '@/lib/utils'

const schema = z.object({
  topup_on: z.string().min(1),
  volume_liters: z.coerce.number().positive(),
  amount: z.coerce.number().positive(),
  vendor_name: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function NewPumpTopupInner() {
  const propertyId = useCurrentPropertyId()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const create = useMutation({
    mutationFn: pumpTopupsEndpoints.create,
    onSuccess: () => {
      toast.success('Pump topup created')
      queryClient.invalidateQueries({ queryKey: ['pump_topups'] })
      router.push('/app/pump-topups')
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3"><Link href="/app/pump-topups"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><PageHeader title="New Pump Topup" description="Record pump topup" /></div>
      <form onSubmit={handleSubmit((values) => {
        if (!propertyId) return setError('root.server', { message: 'Select a property first' })
        create.mutate({ pump_topup: { property_id: propertyId, topup_on: values.topup_on, volume_liters: values.volume_liters, amount_cents: toCents(values.amount), vendor_name: values.vendor_name || undefined, notes: values.notes || undefined } })
      })} className="space-y-4">
        <Card className="p-6 space-y-4">
          <input {...register('topup_on')} type="date" className="h-9 w-full rounded-md border px-3 text-sm" />
          <input {...register('volume_liters')} type="number" step="0.001" placeholder="Volume liters" className="h-9 w-full rounded-md border px-3 text-sm" />
          <input {...register('amount')} type="number" step="0.01" placeholder="Amount" className="h-9 w-full rounded-md border px-3 text-sm" />
          <input {...register('vendor_name')} placeholder="Vendor" className="h-9 w-full rounded-md border px-3 text-sm" />
          <textarea {...register('notes')} rows={3} placeholder="Notes" className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>
        <div className="flex justify-end gap-2"><Link href="/app/pump-topups"><Button type="button" variant="outline">Cancel</Button></Link><Button type="submit" loading={create.isPending}>Create</Button></div>
      </form>
    </div>
  )
}

export default function NewPumpTopupPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><NewPumpTopupInner /></RoleGate>
}
