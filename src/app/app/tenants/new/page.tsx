'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { tenantsEndpoints } from '@/lib/api/endpoints/tenants'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const schema = z.object({
  full_name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Required'),
  national_id: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']),
})

type FormValues = z.infer<typeof schema>

function NewTenantInner() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const queryClient = useQueryClient()
  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  })
  const { mutate, isPending } = useMutation({
    mutationFn: tenantsEndpoints.create,
    onSuccess: () => {
      toast.success('Tenant created')
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      router.push('/app/tenants')
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  const onSubmit = (values: FormValues) => {
    if (!propertyId) {
      setError('root.server', { message: 'Select a property first' })
      return
    }
    mutate({
      tenant: {
        property_id: propertyId,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        national_id: values.national_id || undefined,
        status: values.status,
      },
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3"><Link href="/app/tenants"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link><PageHeader title="New Tenant" description="Create tenant profile" /></div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card className="p-6 space-y-4">
          <input {...register('full_name')} placeholder="Full name" className="h-9 w-full rounded-md border px-3 text-sm" />
          <input {...register('email')} placeholder="Email" className="h-9 w-full rounded-md border px-3 text-sm" />
          <input {...register('phone')} placeholder="Phone" className="h-9 w-full rounded-md border px-3 text-sm" />
          <input {...register('national_id')} placeholder="National ID" className="h-9 w-full rounded-md border px-3 text-sm" />
          <select {...register('status')} className="h-9 w-full rounded-md border px-3 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option><option value="archived">Archived</option></select>
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Unit assignment is lease-based. Create a lease from <Link href="/app/leases/new" className="underline font-medium">New Lease</Link> to link this tenant to a unit.
          </p>
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>
        <div className="flex justify-end gap-2"><Link href="/app/tenants"><Button type="button" variant="outline">Cancel</Button></Link><Button type="submit" loading={isPending}>Create Tenant</Button></div>
      </form>
    </div>
  )
}

export default function NewTenantPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager']}><NewTenantInner /></RoleGate>
}
