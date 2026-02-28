'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { addMonths, format, parseISO } from 'date-fns'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { leasesEndpoints } from '@/lib/api/endpoints/leases'
import { propertiesEndpoints } from '@/lib/api/endpoints/properties'
import { tenantsEndpoints } from '@/lib/api/endpoints/tenants'
import { unitsEndpoints } from '@/lib/api/endpoints/units'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { formatCents, toCents } from '@/lib/utils'

const schema = z.object({
  property_id: z.string().uuid('Must be a valid UUID'),
  unit_id: z.string().uuid('Must be a valid UUID'),
  tenant_id: z.string().uuid('Must be a valid UUID'),
  start_date: z.string().min(1, 'Required'),
  plan_months: z.enum(['3', '6', '12']),
  rent_ghs: z.coerce.number().positive('Must be positive'),
  security_deposit_ghs: z.coerce.number().min(0, 'Must be 0 or greater'),
  status: z.enum(['active', 'pending']),
})

type FormValues = z.infer<typeof schema>

function computeEndDate(startDate: string, planMonths: number): string {
  try {
    const d = addMonths(parseISO(startDate), planMonths)
    return format(d, 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

function buildTermPreview(startDate: string, endDate: string, planMonths: number, monthlyRentCents: number) {
  if (!startDate || !endDate || !planMonths || !monthlyRentCents) return []
  const total = monthlyRentCents * planMonths
  return [{
    period: `${format(parseISO(startDate), 'MMM d, yyyy')} to ${format(parseISO(endDate), 'MMM d, yyyy')}`,
    months: planMonths,
    monthly: monthlyRentCents,
    total,
  }]
}

export default function NewLeasePage() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const queryClient = useQueryClient()
  const [endDate, setEndDate] = useState('')
  const [termPreview, setTermPreview] = useState<{ period: string; months: number; monthly: number; total: number }[]>([])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      property_id: propertyId ?? '',
      status: 'active',
      plan_months: '12',
      security_deposit_ghs: 0,
    },
  })

  const selectedPropertyId = watch('property_id')
  const startDate = watch('start_date')
  const planMonths = watch('plan_months')
  const rentGhs = watch('rent_ghs')

  const propertiesQuery = useQuery({
    queryKey: ['lease-form-properties'],
    queryFn: () => propertiesEndpoints.list({ per_page: 200 }),
  })

  const tenantsQuery = useQuery({
    queryKey: ['lease-form-tenants', selectedPropertyId],
    queryFn: () => tenantsEndpoints.list({ property_id: selectedPropertyId, per_page: 200 }),
    enabled: Boolean(selectedPropertyId),
  })

  const unitsQuery = useQuery({
    queryKey: ['lease-form-units', selectedPropertyId],
    queryFn: () => unitsEndpoints.list({ property_id: selectedPropertyId, per_page: 200 }),
    enabled: Boolean(selectedPropertyId),
  })

  useEffect(() => {
    if (!watch('property_id') && propertyId) {
      setValue('property_id', propertyId, { shouldValidate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, setValue])

  useEffect(() => {
    if (startDate && planMonths) {
      const months = parseInt(planMonths, 10)
      const computedEndDate = computeEndDate(startDate, months)
      setEndDate(computedEndDate)
      setTermPreview(buildTermPreview(startDate, computedEndDate, months, toCents(rentGhs || 0)))
    }
  }, [startDate, planMonths, rentGhs])

  const { mutate, isPending } = useMutation({
    mutationFn: leasesEndpoints.create,
    onSuccess: () => {
      toast.success('Lease created successfully')
      queryClient.invalidateQueries({ queryKey: ['app-leases'] })
      router.push(`/app/leases`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create lease')
    },
  })

  const onSubmit = (values: FormValues) => {
    if (!values.property_id) {
      toast.error('Select a property')
      return
    }
    mutate({
      lease: {
        property_id: values.property_id,
        unit_id: values.unit_id,
        tenant_id: values.tenant_id,
        start_date: values.start_date,
        end_date: endDate,
        plan_months: parseInt(values.plan_months, 10) as 3 | 6 | 12,
        status: values.status,
        rent_cents: toCents(values.rent_ghs),
        security_deposit_cents: toCents(values.security_deposit_ghs),
      },
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/app/leases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title="New Lease" description="Create a lease with one term invoice/installment (3, 6, or 12 months)" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* IDs */}
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Parties &amp; Unit</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Property</label>
              <Controller
                name="property_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(value) => {
                    field.onChange(value)
                    setValue('tenant_id', '')
                    setValue('unit_id', '')
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {(propertiesQuery.data?.data ?? []).map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.property_id && <p className="text-xs text-red-600">{errors.property_id.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Tenant</label>
              <Controller
                name="tenant_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {(tenantsQuery.data?.data ?? []).map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.full_name ?? (`${tenant.first_name ?? ''} ${tenant.last_name ?? ''}`.trim() || tenant.email)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tenant_id && <p className="text-xs text-red-600">{errors.tenant_id.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <Controller
                name="unit_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {(unitsQuery.data?.data ?? []).map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.unit_number}{unit.name ? ` - ${unit.name}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.unit_id && <p className="text-xs text-red-600">{errors.unit_id.message}</p>}
            </div>
          </div>
        </Card>

        {/* Lease Terms */}
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Lease Terms</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                {...register('start_date')}
                type="date"
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.start_date && <p className="text-xs text-red-600">{errors.start_date.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Plan (months)</label>
              <Controller
                name="plan_months"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <div className="flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">
                <CalendarDays className="mr-2 h-3.5 w-3.5 text-gray-400" />
                {endDate || '—'}
              </div>
              <p className="text-xs text-gray-400">Auto-computed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Monthly Rent (GHS)</label>
              <input
                {...register('rent_ghs')}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.rent_ghs && <p className="text-xs text-red-600">{errors.rent_ghs.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Security Deposit (GHS)</label>
              <input
                {...register('security_deposit_ghs')}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.security_deposit_ghs && (
                <p className="text-xs text-red-600">{errors.security_deposit_ghs.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Term Billing Preview */}
        {termPreview.length > 0 && (
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Term Billing Preview (1 installment)
            </h2>
            <div className="max-h-56 overflow-y-auto space-y-1">
              {termPreview.map((row, i) => (
                <div key={i} className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm even:bg-gray-50">
                  <div>
                    <span className="text-gray-700 font-medium">Term: </span>
                    <span className="text-gray-600">{row.period}</span>
                    <span className="ml-2 text-gray-500">({row.months} months)</span>
                  </div>
                  <span className="font-medium tabular-nums">{formatCents(row.total)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
              <span className="font-medium text-gray-700">Invoice Total</span>
              <span className="font-semibold tabular-nums">
                {formatCents(termPreview.reduce((s, r) => s + r.total, 0))}
              </span>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Full-term payment marks the term installment paid and sets lease paid-through date to end date.
            </p>
          </Card>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/app/leases">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" loading={isPending}>
            Create Lease
          </Button>
        </div>
      </form>
    </div>
  )
}
