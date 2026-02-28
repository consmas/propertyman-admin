'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { tenantsEndpoints } from '@/lib/api/endpoints/tenants'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'

const schema = z.object({
  full_name: z.string().min(1),
  phone: z.string().min(1),
  status: z.enum(['active', 'inactive', 'archived']),
})

type FormValues = z.infer<typeof schema>

function EditTenantInner() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tenants', params.id],
    queryFn: () => tenantsEndpoints.get(params.id),
    onSuccess: (res) => {
      reset({
        full_name: res.data.full_name ?? `${res.data.first_name ?? ''} ${res.data.last_name ?? ''}`.trim(),
        phone: res.data.phone,
        status: res.data.status,
      })
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) => tenantsEndpoints.update(params.id, {
      tenant: {
        property_id: data?.data?.property_id,
        full_name: values.full_name,
        phone: values.phone,
        status: values.status,
      },
    }),
    onSuccess: () => {
      toast.success('Tenant updated')
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      router.push(`/app/tenants/${params.id}`)
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  if (isLoading) return <PageLoader />
  if (isError || !data?.data) return <ErrorState message="Failed to load tenant" onRetry={() => refetch()} />

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3"><Link href={`/app/tenants/${params.id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><PageHeader title="Edit Tenant" description={data.data.email} /></div>
      <form onSubmit={handleSubmit((values) => mutate(values))} className="space-y-4">
        <Card className="p-6 space-y-4">
          <input {...register('full_name')} className="h-9 w-full rounded-md border px-3 text-sm" />
          <input {...register('phone')} className="h-9 w-full rounded-md border px-3 text-sm" />
          <p className="text-xs text-[var(--text-tertiary)]">
            Unit assignment is lease-based. To assign this tenant to a unit, create or edit a lease.
          </p>
          <select {...register('status')} className="h-9 w-full rounded-md border px-3 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option><option value="archived">Archived</option></select>
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>
        <div className="flex justify-end gap-2"><Link href={`/app/tenants/${params.id}`}><Button type="button" variant="outline">Cancel</Button></Link><Button type="submit" loading={isPending}>Save</Button></div>
      </form>
    </div>
  )
}

export default function EditTenantPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager']}><EditTenantInner /></RoleGate>
}
