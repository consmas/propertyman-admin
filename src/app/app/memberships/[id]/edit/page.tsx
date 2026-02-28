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
import { propertyMembershipsEndpoints } from '@/lib/api/endpoints/property-memberships'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'

const schema = z.object({
  role: z.enum(['admin', 'property_manager', 'accountant', 'caretaker', 'tenant']),
  status: z.enum(['active', 'inactive']),
})

type FormValues = z.infer<typeof schema>

function MembershipEditInner() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['memberships', params.id],
    queryFn: () => propertyMembershipsEndpoints.get(params.id),
  })

  useEffect(() => {
    if (data?.data) {
      reset({ role: data.data.role, status: data.data.status ?? 'active' })
    }
  }, [data, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) => propertyMembershipsEndpoints.update(params.id, { property_membership: values }),
    onSuccess: () => {
      toast.success('Membership updated')
      queryClient.invalidateQueries({ queryKey: ['memberships'] })
      router.push('/app/memberships')
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  if (isLoading) return <PageLoader />
  if (isError || !data?.data) return <ErrorState message="Failed to load membership" onRetry={() => refetch()} />

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3"><Link href="/app/memberships"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><PageHeader title="Edit Membership" description={data.data.id} /></div>
      <form onSubmit={handleSubmit((values) => mutate(values))} className="space-y-4">
        <Card className="p-6 space-y-4">
          <p className="text-xs text-gray-500">User: <span className="font-mono">{data.data.user_id}</span></p>
          <p className="text-xs text-gray-500">Property: <span className="font-mono">{data.data.property_id}</span></p>
          <select {...register('role')} className="h-9 w-full rounded-md border px-3 text-sm">
            <option value="admin">Admin</option>
            <option value="property_manager">Property Manager</option>
            <option value="accountant">Accountant</option>
            <option value="caretaker">Caretaker</option>
            <option value="tenant">Tenant</option>
          </select>
          <select {...register('status')} className="h-9 w-full rounded-md border px-3 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select>
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>
        <div className="flex justify-end gap-2"><Link href="/app/memberships"><Button type="button" variant="outline">Cancel</Button></Link><Button type="submit" loading={isPending}>Save</Button></div>
      </form>
    </div>
  )
}

export default function EditMembershipPage() {
  return <RoleGate roles={['owner', 'admin']}><MembershipEditInner /></RoleGate>
}
