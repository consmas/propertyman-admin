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
import { maintenanceEndpoints } from '@/lib/api/endpoints/maintenance'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/shared/loading-spinner'
import { ErrorState } from '@/components/shared/error-state'

const schema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function EditMaintenanceInner() {
  const params = useParams<{ maintenanceId: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const query = useQuery({ queryKey: ['app-maintenance', params.maintenanceId], queryFn: () => maintenanceEndpoints.get(params.maintenanceId) })

  useEffect(() => {
    if (query.data?.data) {
      reset({ status: query.data.data.status, priority: query.data.data.priority, notes: query.data.data.notes ?? '' })
    }
  }, [query.data, reset])

  const update = useMutation({
    mutationFn: (values: FormValues) => maintenanceEndpoints.update(params.maintenanceId, { maintenance_request: values }),
    onSuccess: () => {
      toast.success('Maintenance request updated')
      queryClient.invalidateQueries({ queryKey: ['app-maintenance'] })
      router.push(`/app/maintenance/${params.maintenanceId}`)
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  if (query.isLoading) return <PageLoader />
  if (query.isError || !query.data?.data) return <ErrorState message="Failed to load maintenance request" onRetry={() => query.refetch()} />

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3"><Link href={`/app/maintenance/${params.maintenanceId}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><PageHeader title="Edit Maintenance Request" description={params.maintenanceId} /></div>
      <form onSubmit={handleSubmit((values) => update.mutate(values))} className="space-y-4">
        <Card className="p-6 space-y-4">
          <select {...register('status')} className="h-9 w-full rounded-md border px-3 text-sm"><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option><option value="cancelled">Cancelled</option></select>
          <select {...register('priority')} className="h-9 w-full rounded-md border px-3 text-sm"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
          <textarea {...register('notes')} rows={4} className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>
        <div className="flex justify-end gap-2"><Link href={`/app/maintenance/${params.maintenanceId}`}><Button type="button" variant="outline">Cancel</Button></Link><Button type="submit" loading={update.isPending}>Save</Button></div>
      </form>
    </div>
  )
}

export default function EditMaintenancePage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><EditMaintenanceInner /></RoleGate>
}
