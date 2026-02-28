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
import { meterReadingsEndpoints } from '@/lib/api/endpoints/meter-readings'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/shared/loading-spinner'
import { ErrorState } from '@/components/shared/error-state'

const schema = z.object({
  reading_value: z.coerce.number().min(0),
  reading_on: z.string().min(1),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

function EditMeterReadingInner() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const query = useQuery({ queryKey: ['meter_readings', params.id], queryFn: () => meterReadingsEndpoints.get(params.id) })

  useEffect(() => {
    if (query.data?.data) {
      reset({ reading_value: query.data.data.reading_value, reading_on: query.data.data.reading_on, notes: query.data.data.notes ?? '' })
    }
  }, [query.data, reset])

  const update = useMutation({
    mutationFn: (values: FormValues) => meterReadingsEndpoints.update(params.id, { meter_reading: values }),
    onSuccess: () => {
      toast.success('Meter reading updated')
      queryClient.invalidateQueries({ queryKey: ['meter_readings'] })
      router.push(`/app/meter-readings/${params.id}`)
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  if (query.isLoading) return <PageLoader />
  if (query.isError || !query.data?.data) return <ErrorState message="Failed to load meter reading" onRetry={() => query.refetch()} />

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3"><Link href={`/app/meter-readings/${params.id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><PageHeader title="Edit Meter Reading" description={params.id} /></div>
      <form onSubmit={handleSubmit((values) => update.mutate(values))} className="space-y-4">
        <Card className="p-6 space-y-4">
          <input {...register('reading_value')} type="number" step="0.001" className="h-9 w-full rounded-md border px-3 text-sm" />
          <input {...register('reading_on')} type="date" className="h-9 w-full rounded-md border px-3 text-sm" />
          <textarea {...register('notes')} rows={3} className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>
        <div className="flex justify-end gap-2"><Link href={`/app/meter-readings/${params.id}`}><Button type="button" variant="outline">Cancel</Button></Link><Button type="submit" loading={update.isPending}>Save</Button></div>
      </form>
    </div>
  )
}

export default function EditMeterReadingPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><EditMeterReadingInner /></RoleGate>
}
