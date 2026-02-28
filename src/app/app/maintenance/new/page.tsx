'use client'

import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { maintenanceEndpoints } from '@/lib/api/endpoints/maintenance'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { MaintenancePriority } from '@/types/api'

const schema = z.object({
  unit_id: z.string().uuid('Must be a valid UUID'),
  tenant_id: z.string().uuid('Must be a valid UUID').optional().or(z.literal('')),
  title: z.string().min(3, 'At least 3 characters').max(200),
  description: z.string().min(10, 'At least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  requested_at: z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof schema>

const PRIORITIES: { value: MaintenancePriority; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'Can be addressed in regular maintenance cycle' },
  { value: 'medium', label: 'Medium', description: 'Should be addressed within 1 week' },
  { value: 'high', label: 'High', description: 'Requires attention within 48 hours' },
  { value: 'urgent', label: 'Urgent', description: 'Immediate action required — safety/habitability risk' },
]

export default function NewMaintenancePage() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 'medium',
      requested_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  })

  const selectedPriority = watch('priority')

  const { mutate, isPending } = useMutation({
    mutationFn: maintenanceEndpoints.create,
    onSuccess: () => {
      toast.success('Maintenance request created')
      queryClient.invalidateQueries({ queryKey: ['app-maintenance'] })
      router.push('/app/maintenance')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create request')
    },
  })

  const onSubmit = (values: FormValues) => {
    if (!propertyId) {
      toast.error('No property selected')
      return
    }
    mutate({
      maintenance_request: {
        property_id: propertyId,
        unit_id: values.unit_id,
        tenant_id: values.tenant_id || undefined,
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: 'open',
        requested_at: new Date(values.requested_at).toISOString(),
      },
    })
  }

  const priorityInfo = PRIORITIES.find(p => p.value === selectedPriority)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/app/maintenance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title="New Maintenance Request" description="Log an issue for a unit" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Location</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Unit ID</label>
              <input
                {...register('unit_id')}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              {errors.unit_id && <p className="text-xs text-red-600">{errors.unit_id.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Tenant ID <span className="text-gray-400">(optional)</span>
              </label>
              <input
                {...register('tenant_id')}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              {errors.tenant_id && <p className="text-xs text-red-600">{errors.tenant_id.message}</p>}
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Issue Details</h2>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              {...register('title')}
              placeholder="e.g. Broken pipe in bathroom"
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe the issue in detail — location, symptoms, any safety concerns…"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {priorityInfo && (
                <p className="text-xs text-gray-500">{priorityInfo.description}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Requested At</label>
              <input
                {...register('requested_at')}
                type="datetime-local"
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.requested_at && (
                <p className="text-xs text-red-600">{errors.requested_at.message}</p>
              )}
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/app/maintenance">
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
