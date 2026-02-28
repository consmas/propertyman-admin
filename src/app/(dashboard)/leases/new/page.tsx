'use client'

import { Suspense } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { leasesApi } from '@/lib/api/leases'
import { tenantsApi } from '@/lib/api/tenants'
import { unitsApi } from '@/lib/api/units'
import { parseList } from '@/lib/jsonapi'
import { createLeaseSchema, type CreateLeaseFormValues } from '@/lib/validations/lease'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TenantAttributes, UnitAttributes } from '@/types'
import { addMonths, format } from 'date-fns'

function computeInstallmentPreview(
  startDate: string,
  durationMonths: number,
  monthlyRent: number
): Array<{ month: string; due_date: string; amount: number }> {
  if (!startDate || !durationMonths || !monthlyRent) return []
  try {
    const start = new Date(startDate)
    return Array.from({ length: durationMonths }, (_, i) => {
      const dueDate = addMonths(start, i)
      return {
        month: format(dueDate, 'MMM yyyy'),
        due_date: format(dueDate, 'yyyy-MM-dd'),
        amount: monthlyRent,
      }
    })
  } catch {
    return []
  }
}

function NewLeaseForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = useCurrentPropertyId()
  const queryClient = useQueryClient()
  const preselectedUnit = searchParams.get('unit') ?? ''

  const { data: tenantsData } = useQuery({
    queryKey: ['tenants', propertyId],
    queryFn: () => tenantsApi.list(propertyId!, { per_page: 100, status: 'active' }),
    enabled: !!propertyId,
  })

  const { data: unitsData } = useQuery({
    queryKey: ['units', propertyId, 'vacant'],
    queryFn: () => unitsApi.list(propertyId!, { per_page: 100, status: 'vacant' }),
    enabled: !!propertyId,
  })

  const tenants = tenantsData ? parseList<TenantAttributes>(tenantsData as never).data : []
  const units = unitsData ? parseList<UnitAttributes>(unitsData as never).data : []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateLeaseFormValues>({
    resolver: zodResolver(createLeaseSchema),
    defaultValues: {
      unit_id: preselectedUnit,
      duration_months: 12,
      security_deposit: 0,
    },
  })

  const watchedValues = watch()
  const preview = computeInstallmentPreview(
    watchedValues.start_date,
    watchedValues.duration_months,
    watchedValues.monthly_rent
  )

  const mutation = useMutation({
    mutationFn: (values: CreateLeaseFormValues) =>
      leasesApi.create(propertyId!, {
        ...values,
        duration_months: values.duration_months as 3 | 6 | 12,
      }),
    onSuccess: () => {
      toast.success('Lease created successfully')
      queryClient.invalidateQueries({ queryKey: ['leases', propertyId] })
      router.push('/dashboard/leases')
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create lease')
    },
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/leases">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader title="New Lease" description="Create a lease agreement and generate installment schedule" />
      </div>

      <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Lease Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Tenant */}
            <div className="space-y-1">
              <Label>Tenant</Label>
              <Select
                onValueChange={(v) => setValue('tenant_id', v)}
                defaultValue={watchedValues.tenant_id}
              >
                <SelectTrigger error={errors.tenant_id?.message}>
                  <SelectValue placeholder="Select tenant…" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.first_name} {t.last_name} — {t.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tenant_id && <p className="text-xs text-red-600">{errors.tenant_id.message}</p>}
            </div>

            {/* Unit */}
            <div className="space-y-1">
              <Label>Unit</Label>
              <Select
                onValueChange={(v) => setValue('unit_id', v)}
                defaultValue={watchedValues.unit_id}
              >
                <SelectTrigger error={errors.unit_id?.message}>
                  <SelectValue placeholder="Select vacant unit…" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      Unit {u.unit_number} — {formatCurrency(u.monthly_rent)}/mo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit_id && <p className="text-xs text-red-600">{errors.unit_id.message}</p>}
            </div>

            {/* Start date + duration */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Start Date"
                type="date"
                {...register('start_date')}
                error={errors.start_date?.message}
              />
              <div className="space-y-1">
                <Label>Duration</Label>
                <Select
                  onValueChange={(v) => setValue('duration_months', Number(v) as 3 | 6 | 12)}
                  defaultValue={String(watchedValues.duration_months)}
                >
                  <SelectTrigger error={errors.duration_months?.message}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                  </SelectContent>
                </Select>
                {errors.duration_months && <p className="text-xs text-red-600">{errors.duration_months.message}</p>}
              </div>
            </div>

            {/* Rent + Deposit */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Monthly Rent (GHS)"
                type="number"
                min={0}
                step={100}
                {...register('monthly_rent')}
                error={errors.monthly_rent?.message}
              />
              <Input
                label="Security Deposit (GHS)"
                type="number"
                min={0}
                step={100}
                {...register('security_deposit')}
                error={errors.security_deposit?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Installment preview */}
        {preview.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Rent Installment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {preview.map((inst, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{inst.month}</p>
                      <p className="text-xs text-gray-500">Due: {formatDate(inst.due_date)}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(inst.amount)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                <span className="text-sm font-medium text-gray-700">Total lease value</span>
                <span className="text-base font-bold text-gray-900">
                  {formatCurrency((watchedValues.monthly_rent ?? 0) * preview.length)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/leases">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" loading={mutation.isPending}>
            Create Lease
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function NewLeasePage() {
  return (
    <Suspense fallback={<div />}>
      <NewLeaseForm />
    </Suspense>
  )
}
