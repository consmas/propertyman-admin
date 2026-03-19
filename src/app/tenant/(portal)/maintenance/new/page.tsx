'use client'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTenantProfile } from '@/hooks/use-tenant'
import { leasesEndpoints } from '@/lib/api/endpoints/leases'
import { maintenanceEndpoints } from '@/lib/api/endpoints/maintenance'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import type { MaintenancePriority } from '@/types/api'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
})

type FormValues = z.infer<typeof schema>

const PRIORITIES: { value: MaintenancePriority; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'Can be addressed in regular maintenance cycle' },
  { value: 'medium', label: 'Medium', description: 'Should be addressed within 1 week' },
  { value: 'high', label: 'High', description: 'Requires attention within 48 hours' },
  { value: 'urgent', label: 'Urgent', description: 'Immediate action required — safety/habitability risk' },
]

export default function TenantNewMaintenancePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: tenant, isLoading: loadingTenant, isError: tenantError } = useTenantProfile()

  const tenantId = tenant?.id
  const propertyId = tenant?.property_id

  const { data: leasesRes } = useQuery({
    queryKey: ['tenant-leases-maintenance', tenantId, propertyId],
    queryFn: () => leasesEndpoints.list({ property_id: propertyId! }),
    enabled: Boolean(propertyId),
  })

  const activeLease =
    leasesRes?.data?.find((l) => l.tenant_id === tenantId && l.status === 'active') ??
    leasesRes?.data?.find((l) => l.tenant_id === tenantId)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium' },
  })

  const selectedPriority = watch('priority')

  const { mutate, isPending } = useMutation({
    mutationFn: maintenanceEndpoints.create,
    onSuccess: () => {
      toast.success('Maintenance request submitted successfully')
      queryClient.invalidateQueries({ queryKey: ['tenant-maintenance-list'] })
      router.push('/tenant/maintenance')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit request')
    },
  })

  const onSubmit = (values: FormValues) => {
    if (!propertyId || !tenantId) {
      toast.error('Profile not loaded. Please try again.')
      return
    }
    if (!activeLease?.unit_id) {
      toast.error('No active lease found. Cannot submit maintenance request.')
      return
    }
    mutate({
      maintenance_request: {
        property_id: propertyId,
        unit_id: activeLease.unit_id,
        tenant_id: tenantId,
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: 'open',
        requested_at: new Date().toISOString(),
      },
    })
  }

  if (loadingTenant) return <PageLoader />

  if (tenantError || !tenant) {
    return (
      <ErrorState
        title="Profile not found"
        message="Your tenant profile could not be loaded. Please contact your property manager."
      />
    )
  }

  const priorityInfo = PRIORITIES.find((p) => p.value === selectedPriority)

  return (
    <div className="fade-up space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/tenant/maintenance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title="Submit Maintenance Request" description="Report an issue that needs attention" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card className="p-6">
          <h3
            className="font-display text-[15px] font-semibold mb-5"
            style={{ color: 'var(--text-primary)' }}
          >
            Request Details
          </h3>
          <div className="space-y-4">
            <Input
              {...register('title')}
              label="Title"
              placeholder="e.g. Broken pipe in bathroom"
              error={errors.title?.message}
            />

            <div className="space-y-1.5">
              <label
                className="block text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Description
              </label>
              <textarea
                {...register('description')}
                rows={5}
                placeholder="Describe the issue in detail — location, symptoms, any safety concerns…"
                className="w-full rounded-[10px] px-3 py-2.5 text-sm resize-none outline-none transition-all"
                style={{
                  border: errors.description
                    ? '1.5px solid var(--error-500)'
                    : '1.5px solid var(--border-default)',
                  background: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                }}
              />
              {errors.description && (
                <p className="text-[12px]" style={{ color: 'var(--error-500)' }}>
                  {errors.description.message}
                </p>
              )}
            </div>

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger label="Priority" error={errors.priority?.message}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {priorityInfo && (
                    <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                      {priorityInfo.description}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Link href="/tenant/maintenance">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" loading={isPending}>
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  )
}
