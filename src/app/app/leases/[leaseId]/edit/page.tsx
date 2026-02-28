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
import { leasesEndpoints } from '@/lib/api/endpoints/leases'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/shared/loading-spinner'
import { ErrorState } from '@/components/shared/error-state'
import { toCents } from '@/lib/utils'

const schema = z.object({
  start_date: z.string().min(1),
  status: z.enum(['active', 'pending', 'expired', 'terminated']),
  plan_months: z.coerce.number().int().refine((v) => v === 3 || v === 6 || v === 12, 'Plan must be 3, 6, or 12 months'),
  end_date: z.string().min(1),
  rent_ghs: z.coerce.number().min(0),
  security_deposit_ghs: z.coerce.number().min(0),
})

type FormValues = z.infer<typeof schema>

function EditLeaseInner() {
  const params = useParams<{ leaseId: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const query = useQuery({ queryKey: ['app-leases', params.leaseId], queryFn: () => leasesEndpoints.get(params.leaseId) })

  useEffect(() => {
    if (query.data?.data) {
      reset({
        start_date: query.data.data.start_date,
        status: query.data.data.status,
        plan_months: query.data.data.plan_months,
        end_date: query.data.data.end_date,
        rent_ghs: query.data.data.rent_cents / 100,
        security_deposit_ghs: query.data.data.security_deposit_cents / 100,
      })
    }
  }, [query.data, reset])

  const update = useMutation({
    mutationFn: (values: FormValues) =>
      leasesEndpoints.update(params.leaseId, {
        lease: {
          start_date: values.start_date,
          status: values.status,
          plan_months: values.plan_months as 3 | 6 | 12,
          end_date: values.end_date,
          rent_cents: toCents(values.rent_ghs),
          security_deposit_cents: toCents(values.security_deposit_ghs),
        },
      }),
    onSuccess: () => {
      toast.success('Lease updated')
      queryClient.invalidateQueries({ queryKey: ['app-leases'] })
      queryClient.invalidateQueries({ queryKey: ['app-lease', params.leaseId] })
      router.push(`/app/leases/${params.leaseId}`)
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  if (query.isLoading) return <PageLoader />
  if (query.isError || !query.data?.data) return <ErrorState message="Failed to load lease" onRetry={() => query.refetch()} />

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3"><Link href={`/app/leases/${params.leaseId}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><PageHeader title="Edit Lease" description={params.leaseId} /></div>
      <form onSubmit={handleSubmit((values) => update.mutate(values))} className="space-y-4">
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input {...register('start_date')} type="date" className="h-9 w-full rounded-md border px-3 text-sm" />
            <input {...register('end_date')} type="date" className="h-9 w-full rounded-md border px-3 text-sm" />
          </div>
          <select {...register('plan_months', { valueAsNumber: true })} className="h-9 w-full rounded-md border px-3 text-sm">
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
          <select {...register('status')} className="h-9 w-full rounded-md border px-3 text-sm"><option value="active">Active</option><option value="pending">Pending</option><option value="expired">Expired</option><option value="terminated">Terminated</option></select>
          <input {...register('rent_ghs')} type="number" step="0.01" className="h-9 w-full rounded-md border px-3 text-sm" placeholder="Monthly rent (GHS)" />
          <input {...register('security_deposit_ghs')} type="number" step="0.01" className="h-9 w-full rounded-md border px-3 text-sm" placeholder="Security deposit (GHS)" />
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>
        <div className="flex justify-end gap-2"><Link href={`/app/leases/${params.leaseId}`}><Button type="button" variant="outline">Cancel</Button></Link><Button type="submit" loading={update.isPending}>Save</Button></div>
      </form>
    </div>
  )
}

export default function EditLeasePage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager']}><EditLeaseInner /></RoleGate>
}
