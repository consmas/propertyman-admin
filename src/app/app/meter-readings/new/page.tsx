'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { meterReadingsEndpoints } from '@/lib/api/endpoints/meter-readings'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const schema = z.object({
  unit_id: z.string().uuid().optional().or(z.literal('')),
  meter_type: z.enum(['water', 'electricity', 'gas', 'other']),
  reading_value: z.coerce.number().min(0),
  reading_on: z.string().min(1),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function NewMeterReadingInner() {
  const propertyId = useCurrentPropertyId()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { meter_type: 'water' } })

  const { mutate, isPending } = useMutation({
    mutationFn: meterReadingsEndpoints.create,
    onSuccess: () => {
      toast.success('Meter reading created')
      queryClient.invalidateQueries({ queryKey: ['meter_readings'] })
      router.push('/app/meter-readings')
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3"><Link href="/app/meter-readings"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><PageHeader title="New Meter Reading" description="Add reading" /></div>
      <form onSubmit={handleSubmit((values) => {
        if (!propertyId) return setError('root.server', { message: 'Select a property first' })
        mutate({ meter_reading: { property_id: propertyId, unit_id: values.unit_id || undefined, meter_type: values.meter_type, reading_value: values.reading_value, reading_on: values.reading_on, notes: values.notes || undefined } })
      })} className="space-y-4">
        <Card className="p-6 space-y-4">
          <input {...register('unit_id')} placeholder="Unit ID (optional)" className="h-9 w-full rounded-md border px-3 text-sm font-mono" />
          <select {...register('meter_type')} className="h-9 w-full rounded-md border px-3 text-sm"><option value="water">Water</option><option value="electricity">Electricity</option><option value="gas">Gas</option><option value="other">Other</option></select>
          <input {...register('reading_value')} type="number" step="0.001" className="h-9 w-full rounded-md border px-3 text-sm" />
          <input {...register('reading_on')} type="date" className="h-9 w-full rounded-md border px-3 text-sm" />
          <textarea {...register('notes')} rows={3} className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Notes" />
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>
        <div className="flex justify-end gap-2"><Link href="/app/meter-readings"><Button type="button" variant="outline">Cancel</Button></Link><Button type="submit" loading={isPending}>Create Reading</Button></div>
      </form>
    </div>
  )
}

export default function NewMeterReadingPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><NewMeterReadingInner /></RoleGate>
}
