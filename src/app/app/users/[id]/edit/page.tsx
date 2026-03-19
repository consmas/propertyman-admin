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

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  role: z.enum(['owner', 'admin', 'property_manager', 'accountant', 'caretaker', 'tenant']),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

function EditUserInner() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', params.id],
    queryFn: () => usersEndpoints.get(params.id),
  })

  const profileForm = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) })
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    if (data?.data) {
      profileForm.reset({
        full_name: data.data.full_name,
        email: data.data.email,
        role: data.data.role,
        phone: data.data.phone ?? '',
        status: data.data.status ?? 'active',
      })
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateProfile = useMutation({
    mutationFn: (values: ProfileValues) => usersEndpoints.update(params.id, { user: values }),
    onSuccess: () => {
      toast.success('Profile updated')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      router.push(`/app/users/${params.id}`)
    },
    onError: (error) => {
      profileForm.setError('root.server', { message: getErrorMessage(error) })
    },
  })

  const updatePassword = useMutation({
    mutationFn: (values: PasswordValues) => usersEndpoints.update(params.id, { user: values }),
    onSuccess: () => {
      toast.success('Password changed')
      passwordForm.reset()
    },
    onError: (error) => {
      passwordForm.setError('root.server', { message: getErrorMessage(error) })
    },
  })

  if (isLoading) return <PageLoader />
  if (isError || !data?.data) return <ErrorState onRetry={() => refetch()} message="Failed to load user" />

  const { errors: pe } = profileForm.formState
  const { errors: we } = passwordForm.formState

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/app/users/${params.id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title="Edit User" description={data.data.email} />
      </div>

      {/* ── Profile ── */}
      <form onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v))} className="space-y-4">
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Profile Information</h2>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">Full Name</label>
            <input
              {...profileForm.register('full_name')}
              placeholder="Full name"
              className="h-9 w-full rounded-md border px-3 text-sm"
            />
            {pe.full_name && <p className="text-xs text-red-600">{pe.full_name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">Email</label>
            <input
              {...profileForm.register('email')}
              type="email"
              placeholder="Email address"
              className="h-9 w-full rounded-md border px-3 text-sm"
            />
            {pe.email && <p className="text-xs text-red-600">{pe.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">Phone</label>
            <input
              {...profileForm.register('phone')}
              placeholder="Phone number"
              className="h-9 w-full rounded-md border px-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Role</label>
              <select {...profileForm.register('role')} className="h-9 w-full rounded-md border px-3 text-sm">
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="property_manager">Property Manager</option>
                <option value="accountant">Accountant</option>
                <option value="caretaker">Caretaker</option>
                <option value="tenant">Tenant</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Status</label>
              <select {...profileForm.register('status')} className="h-9 w-full rounded-md border px-3 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {pe.root?.server && <p className="text-sm text-red-600">{pe.root.server.message}</p>}
        </Card>

        <div className="flex justify-end gap-2">
          <Link href={`/app/users/${params.id}`}><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" loading={updateProfile.isPending}>Save Profile</Button>
        </div>
      </form>

      {/* ── Change Password ── */}
      <form onSubmit={passwordForm.handleSubmit((v) => updatePassword.mutate(v))} className="space-y-4">
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Change Password</h2>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">New Password</label>
            <input
              {...passwordForm.register('password')}
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className="h-9 w-full rounded-md border px-3 text-sm"
            />
            {we.password && <p className="text-xs text-red-600">{we.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">Confirm New Password</label>
            <input
              {...passwordForm.register('password_confirmation')}
              type="password"
              placeholder="Repeat password"
              autoComplete="new-password"
              className="h-9 w-full rounded-md border px-3 text-sm"
            />
            {we.password_confirmation && (
              <p className="text-xs text-red-600">{we.password_confirmation.message}</p>
            )}
          </div>

          {we.root?.server && <p className="text-sm text-red-600">{we.root.server.message}</p>}
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={updatePassword.isPending} variant="outline">
            Change Password
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function EditUserPage() {
  return <RoleGate roles={['owner', 'admin']}><EditUserInner /></RoleGate>
}
