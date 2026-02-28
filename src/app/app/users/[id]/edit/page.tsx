'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { usersEndpoints } from '@/lib/api/endpoints/users'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/shared/loading-spinner'
import { ErrorState } from '@/components/shared/error-state'

const schema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  role: z.enum(['owner', 'admin', 'property_manager', 'accountant', 'caretaker', 'tenant']),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type FormValues = z.infer<typeof schema>

function EditUserInner() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', params.id],
    queryFn: () => usersEndpoints.get(params.id),
  })

  const {
    register,
    reset,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (data?.data) {
      reset({
        full_name: data.data.full_name,
        role: data.data.role,
        phone: data.data.phone ?? '',
        status: data.data.status ?? 'active',
      })
    }
  }, [data, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) => usersEndpoints.update(params.id, { user: values }),
    onSuccess: () => {
      toast.success('User updated')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      router.push(`/app/users/${params.id}`)
    },
    onError: (error) => {
      setError('root.server', { message: getErrorMessage(error) })
    },
  })

  if (isLoading) return <PageLoader />
  if (isError || !data?.data) return <ErrorState onRetry={() => refetch()} message="Failed to load user" />

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/app/users/${params.id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <PageHeader title="Edit User" description={data.data.email} />
      </div>

      <form onSubmit={handleSubmit((values) => mutate(values))} className="space-y-4">
        <Card className="p-6 space-y-4">
          <input {...register('full_name')} placeholder="Full name" className="h-9 w-full rounded-md border px-3 text-sm" />
          {errors.full_name && <p className="text-xs text-red-600">{errors.full_name.message}</p>}

          <select {...register('role')} className="h-9 w-full rounded-md border px-3 text-sm">
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="property_manager">Property Manager</option>
            <option value="accountant">Accountant</option>
            <option value="caretaker">Caretaker</option>
            <option value="tenant">Tenant</option>
          </select>

          <select {...register('status')} className="h-9 w-full rounded-md border px-3 text-sm">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <input {...register('phone')} placeholder="Phone" className="h-9 w-full rounded-md border px-3 text-sm" />
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>

        <div className="flex justify-end gap-2">
          <Link href={`/app/users/${params.id}`}><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" loading={isPending}>Save Changes</Button>
        </div>
      </form>
    </div>
  )
}

export default function EditUserPage() {
  return <RoleGate roles={['owner', 'admin']}><EditUserInner /></RoleGate>
}
