'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Info } from 'lucide-react'
import { tenantsEndpoints } from '@/lib/api/endpoints/tenants'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const schema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  national_id: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']),
})

type FormValues = z.infer<typeof schema>

function NewTenantInner() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: tenantsEndpoints.create,
    onSuccess: () => {
      toast.success('Tenant created successfully')
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      router.push('/app/tenants')
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  const onSubmit = (values: FormValues) => {
    if (!propertyId) {
      setError('root.server', { message: 'No property selected. Please select a property first.' })
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
    <div className="fade-up max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/tenants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="New Tenant"
          description="Create a new tenant profile for your property"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Personal info */}
        <Card className="p-6">
          <h3 className="font-display text-[15px] font-semibold text-[var(--text-primary)] mb-5">
            Personal Information
          </h3>
          <div className="space-y-4">
            <Input
              {...register('full_name')}
              label="Full Name"
              placeholder="e.g. Kwame Mensah"
              error={errors.full_name?.message}
            />
            <Input
              {...register('email')}
              label="Email Address"
              type="email"
              placeholder="e.g. kwame@email.com"
              error={errors.email?.message}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                {...register('phone')}
                label="Phone Number"
                placeholder="e.g. +233 20 000 0000"
                error={errors.phone?.message}
              />
              <Input
                {...register('national_id')}
                label="National ID"
                placeholder="Optional"
                error={errors.national_id?.message}
              />
            </div>
          </div>
        </Card>

        {/* Status */}
        <Card className="p-6">
          <h3 className="font-display text-[15px] font-semibold text-[var(--text-primary)] mb-5">
            Status
          </h3>
          <Select
            value={watch('status')}
            onValueChange={(v) => setValue('status', v as FormValues['status'])}
          >
            <SelectTrigger label="Account Status" error={errors.status?.message}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-xl border border-[var(--brand-200)] bg-[var(--brand-50)] px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-600)]" />
          <p className="text-[13px] text-[var(--brand-700)]">
            Unit assignment is lease-based.{' '}
            <Link href="/app/leases/new" className="font-semibold underline underline-offset-2">
              Create a lease
            </Link>{' '}
            after saving to link this tenant to a unit.
          </p>
        </div>

        {/* Server error */}
        {errors.root?.server && (
          <div className="rounded-xl border border-[var(--error-500)]/30 bg-[var(--error-50)] px-4 py-3">
            <p className="text-[13px] font-medium text-[var(--error-500)]">
              {errors.root.server.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Link href="/app/tenants">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={isPending}>
            Create Tenant
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function NewTenantPage() {
  return (
    <RoleGate roles={['owner', 'admin', 'property_manager']}>
      <NewTenantInner />
    </RoleGate>
  )
}
