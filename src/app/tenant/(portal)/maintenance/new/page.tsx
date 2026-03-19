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
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/error-state'
import { cn } from '@/lib/utils'
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

  const activeLease = leasesRes?.data?.find(
    l => l.tenant_id === tenantId && l.status === 'active'
  ) ?? leasesRes?.data?.find(l => l.tenant_id === tenantId)

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

  if (loadingTenant) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
        Loading profile…
      </div>
    )
  }

  if (tenantError || !tenant) {
    return (
      <ErrorState
        title="Profile not found"
        message="Your tenant profile could not be loaded. Please contact your property manager."
      />
    )
  }

  const priorityInfo = PRIORITIES.find(p => p.value === selectedPriority)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tenant/maintenance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title="Submit Maintenance Request" description="Report an issue that needs attention" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              placeholder="e.g. Broken pipe in bathroom"
              className={cn(
                'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500',
                errors.title && 'border-red-500 focus:ring-red-500'
              )}
            />
            {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={5}
              placeholder="Describe the issue in detail — location, symptoms, any safety concerns…"
              className={cn(
                'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none',
                errors.description && 'border-red-500 focus:ring-red-500'
              )}
            />
            {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Priority <span className="text-red-500">*</span>
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              )}
            />
            {priorityInfo && (
              <p className="text-xs text-gray-500">{priorityInfo.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/tenant/maintenance">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button
            type="submit"
            loading={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  )
}
