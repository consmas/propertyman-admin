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
import { pumpTopupsEndpoints } from '@/lib/api/endpoints/pump-topups'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/shared/loading-spinner'
import { ErrorState } from '@/components/shared/error-state'

const schema = z.object({
  topup_date: z.string().min(1),
  quantity_liters: z.coerce.number().positive(),
  cost: z.coerce.number().positive(),
  vendor_name: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function EditPumpTopupInner() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const query = useQuery({ queryKey: ['pump_topups', params.id], queryFn: () => pumpTopupsEndpoints.get(params.id) })

  useEffect(() => {
    if (query.data?.data) {
      reset({ topup_date: query.data.data.topup_date, quantity_liters: query.data.data.quantity_liters, cost: query.data.data.cost, vendor_name: query.data.data.vendor_name ?? '', notes: query.data.data.notes ?? '' })
    }
  }, [query.data, reset])

  const update = useMutation({
    mutationFn: (values: FormValues) => pumpTopupsEndpoints.update(params.id, { pump_topup: { topup_date: values.topup_date, quantity_liters: values.quantity_liters, cost: values.cost, vendor_name: values.vendor_name || undefined, notes: values.notes || undefined } }),
    onSuccess: () => {
      toast.success('Pump topup updated')
      queryClient.invalidateQueries({ queryKey: ['pump_topups'] })
      router.push(`/app/pump-topups/${params.id}`)
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  if (query.isLoading) return <PageLoader />
  if (query.isError || !query.data?.data) return <ErrorState message="Failed to load pump topup" onRetry={() => query.refetch()} />

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3"><Link href={`/app/pump-topups/${params.id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><PageHeader title="Edit Pump Topup" description={params.id} /></div>
      <form onSubmit={handleSubmit((values) => update.mutate(values))} className="space-y-4">
        <Card className="p-6 space-y-4">
          <input {...register('topup_date')} type="date" className="h-9 w-full rounded-md border px-3 text-sm" />
          <input {...register('quantity_liters')} type="number" step="0.001" className="h-9 w-full rounded-md border px-3 text-sm" />
          <input {...register('cost')} type="number" step="0.01" className="h-9 w-full rounded-md border px-3 text-sm" />
          <input {...register('vendor_name')} className="h-9 w-full rounded-md border px-3 text-sm" />
          <textarea {...register('notes')} rows={3} className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>
        <div className="flex justify-end gap-2"><Link href={`/app/pump-topups/${params.id}`}><Button type="button" variant="outline">Cancel</Button></Link><Button type="submit" loading={update.isPending}>Save</Button></div>
      </form>
    </div>
  )
}

export default function EditPumpTopupPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><EditPumpTopupInner /></RoleGate>
}
