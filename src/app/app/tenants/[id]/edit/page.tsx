'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Info } from 'lucide-react'
import { tenantsEndpoints } from '@/lib/api/endpoints/tenants'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'

const schema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  status: z.enum(['active', 'inactive', 'archived']),
})

type FormValues = z.infer<typeof schema>

function EditTenantInner() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tenants', params.id],
    queryFn: () => tenantsEndpoints.get(params.id),
  })

  useEffect(() => {
    if (!data?.data) return
    reset({
      full_name:
        data.data.full_name ??
        `${data.data.first_name ?? ''} ${data.data.last_name ?? ''}`.trim(),
      phone: data.data.phone,
      status: data.data.status,
    })
  }, [data, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      tenantsEndpoints.update(params.id, {
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
  if (isError || !data?.data)
    return <ErrorState message="Failed to load tenant" onRetry={() => refetch()} />

  const tenant = data.data

  return (
    <div className="fade-up max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/app/tenants/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="Edit Tenant"
          description={tenant.email}
        />
      </div>

      <form onSubmit={handleSubmit((values) => mutate(values))} className="space-y-5">
        {/* Personal info */}
        <Card className="p-6">
          <h3 className="font-display text-[15px] font-semibold text-[var(--text-primary)] mb-5">
            Personal Information
          </h3>
          <div className="space-y-4">
            <Input
              {...register('full_name')}
              label="Full Name"
              error={errors.full_name?.message}
            />
            {/* Email is read-only */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--text-primary)]">
                Email Address
              </label>
              <div className="flex h-10 w-full items-center rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 text-sm text-[var(--text-tertiary)]">
                {tenant.email}
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)]">Email cannot be changed</p>
            </div>
            <Input
              {...register('phone')}
              label="Phone Number"
              error={errors.phone?.message}
            />
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
            Unit assignment is lease-based. To move this tenant to a different unit, create or edit a lease.
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
          <Link href={`/app/tenants/${params.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function EditTenantPage() {
  return (
    <RoleGate roles={['owner', 'admin', 'property_manager']}>
      <EditTenantInner />
    </RoleGate>
  )
}
