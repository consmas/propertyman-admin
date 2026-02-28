'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { propertyMembershipsEndpoints } from '@/lib/api/endpoints/property-memberships'
import { usersEndpoints } from '@/lib/api/endpoints/users'
import { propertiesEndpoints } from '@/lib/api/endpoints/properties'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const schema = z.object({
  user_id: z.string().uuid('Must be a valid UUID'),
  property_id: z.string().uuid('Must be a valid UUID'),
  role: z.enum(['admin', 'property_manager', 'accountant', 'caretaker', 'tenant']),
  status: z.enum(['active', 'inactive']),
})

type FormValues = z.infer<typeof schema>

function getUserLabel(user: { full_name?: string; email?: string }) {
  return user.full_name || user.email || 'Unknown user'
}

function MembershipNewInner() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'property_manager', status: 'active' },
  })
  const usersQuery = useQuery({
    queryKey: ['memberships-form-users'],
    queryFn: () => usersEndpoints.list({ per_page: 200 }),
  })
  const propertiesQuery = useQuery({
    queryKey: ['memberships-form-properties'],
    queryFn: () => propertiesEndpoints.list({ per_page: 200 }),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: propertyMembershipsEndpoints.create,
    onSuccess: () => {
      toast.success('Membership created')
      queryClient.invalidateQueries({ queryKey: ['memberships'] })
      router.push('/app/memberships')
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3"><Link href="/app/memberships"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><PageHeader title="New Membership" description="Assign a user to a property" /></div>
      <form onSubmit={handleSubmit((values) => mutate({ property_membership: values }))} className="space-y-4">
        <Card className="p-6 space-y-4">
          <select {...register('user_id')} className="h-9 w-full rounded-md border px-3 text-sm">
            <option value="">Select user</option>
            {(usersQuery.data?.data ?? []).map((user) => (
              <option key={user.id} value={user.id}>
                {getUserLabel(user)}
              </option>
            ))}
          </select>
          {errors.user_id && <p className="text-xs text-red-600">{errors.user_id.message}</p>}
          <select {...register('property_id')} className="h-9 w-full rounded-md border px-3 text-sm">
            <option value="">Select property</option>
            {(propertiesQuery.data?.data ?? []).map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
          {errors.property_id && <p className="text-xs text-red-600">{errors.property_id.message}</p>}
          <select {...register('role')} className="h-9 w-full rounded-md border px-3 text-sm">
            <option value="admin">Admin</option>
            <option value="property_manager">Property Manager</option>
            <option value="accountant">Accountant</option>
            <option value="caretaker">Caretaker</option>
            <option value="tenant">Tenant</option>
          </select>
          <select {...register('status')} className="h-9 w-full rounded-md border px-3 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select>
          {(usersQuery.isError || propertiesQuery.isError) && (
            <p className="text-sm text-red-600">Failed to load users/properties. Refresh and try again.</p>
          )}
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>
        <div className="flex justify-end gap-2"><Link href="/app/memberships"><Button type="button" variant="outline">Cancel</Button></Link><Button type="submit" loading={isPending}>Create Membership</Button></div>
      </form>
    </div>
  )
}

export default function NewMembershipPage() {
  return <RoleGate roles={['owner', 'admin']}><MembershipNewInner /></RoleGate>
}
