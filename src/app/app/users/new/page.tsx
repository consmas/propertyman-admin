'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { usersEndpoints } from '@/lib/api/endpoints/users'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const schema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['owner', 'admin', 'property_manager', 'accountant', 'caretaker', 'tenant']),
  password: z.string().min(8, 'At least 8 characters'),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type FormValues = z.infer<typeof schema>

function NewUserInner() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'property_manager', status: 'active' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: usersEndpoints.create,
    onSuccess: () => {
      toast.success('User created')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      router.push('/app/users')
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      setError('root.server', { message })
    },
  })

  const onSubmit = (values: FormValues) => {
    mutate({ user: values })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/app/users"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <PageHeader title="New User" description="Create a platform user" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card className="p-6 space-y-4">
          <input {...register('full_name')} placeholder="Full name" className="h-9 w-full rounded-md border px-3 text-sm" />
          {errors.full_name && <p className="text-xs text-red-600">{errors.full_name.message}</p>}

          <input {...register('email')} placeholder="Email" className="h-9 w-full rounded-md border px-3 text-sm" />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}

          <input {...register('password')} type="password" placeholder="Password" className="h-9 w-full rounded-md border px-3 text-sm" />
          {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}

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

          <input {...register('phone')} placeholder="Phone (optional)" className="h-9 w-full rounded-md border px-3 text-sm" />

          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>

        <div className="flex justify-end gap-2">
          <Link href="/app/users"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" loading={isPending}>Create User</Button>
        </div>
      </form>
    </div>
  )
}

export default function NewUserPage() {
  return <RoleGate roles={['owner', 'admin']}><NewUserInner /></RoleGate>
}
