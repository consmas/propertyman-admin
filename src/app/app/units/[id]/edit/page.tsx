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
import { unitsEndpoints } from '@/lib/api/endpoints/units'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { toCents } from '@/lib/utils'

const UNIT_TYPE_OPTIONS = [
  { value: 'chamber_and_hall_self_contain', label: 'Chamber & Hall Self Contain' },
  { value: 'one_bedroom_self_contain', label: '1 Bedroom Self Contain' },
  { value: 'two_bedroom_self_contain', label: '2 Bedroom Self Contain' },
] as const

function normalizeUnitStatus(status: string | undefined): 'available' | 'occupied' | 'maintenance' | 'unavailable' {
  if (status === 'occupied' || status === 'maintenance' || status === 'unavailable') return status
  if (status === 'reserved') return 'unavailable'
  return 'available'
}

const schema = z.object({
  unit_number: z.string().min(1),
  name: z.string().min(1),
  unit_type: z.enum(UNIT_TYPE_OPTIONS.map((x) => x.value) as [string, ...string[]]),
  status: z.enum(['available', 'occupied', 'maintenance', 'unavailable']),
  monthly_rent_ghs: z
    .string()
    .min(1, 'Monthly rent is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Enter a valid amount'),
})

type FormValues = z.infer<typeof schema>

function EditUnitInner() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['units', params.id],
    queryFn: () => unitsEndpoints.get(params.id),
  })

  const { register, reset, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (data?.data) {
      const rentCents = data.data.monthly_rent_cents ?? data.data.rent_cents ?? 0
      reset({
        unit_number: data.data.unit_number,
        name: data.data.name ?? `Unit ${data.data.unit_number}`,
        unit_type: (data.data.unit_type as FormValues['unit_type']) ?? 'one_bedroom_self_contain',
        status: normalizeUnitStatus(data.data.status),
        monthly_rent_ghs: (rentCents / 100).toFixed(2),
      })
    }
  }, [data, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) => {
      if (!data?.data?.property_id) {
        throw new Error('Missing property id for unit update')
      }
      return unitsEndpoints.update(params.id, {
        unit: {
          property_id: data.data.property_id,
          unit_number: values.unit_number,
          name: values.name,
          unit_type: values.unit_type,
          status: values.status,
          monthly_rent_cents: toCents(Number(values.monthly_rent_ghs)),
          rent_cents: toCents(Number(values.monthly_rent_ghs)),
        },
      })
    },
    onSuccess: () => {
      toast.success('Unit updated')
      queryClient.invalidateQueries({ queryKey: ['units'] })
      router.push(`/app/units/${params.id}`)
    },
    onError: (error) => setError('root.server', { message: getErrorMessage(error) }),
  })

  if (isLoading) return <PageLoader />
  if (isError || !data?.data) return <ErrorState onRetry={() => refetch()} message="Failed to load unit" />

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/app/units/${params.id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <PageHeader title="Edit Unit" description={`Unit ${data.data.unit_number}`} />
      </div>

      <form onSubmit={handleSubmit((values) => mutate(values))} className="space-y-4">
        <Card className="p-6 space-y-4">
          <input {...register('unit_number')} placeholder="Unit number" className="h-9 w-full rounded-md border px-3 text-sm" />
          <input {...register('name')} placeholder="Block number" className="h-9 w-full rounded-md border px-3 text-sm" />
          <select {...register('unit_type')} className="h-9 w-full rounded-md border px-3 text-sm">
            {UNIT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <input
            {...register('monthly_rent_ghs')}
            type="number"
            step="0.01"
            placeholder="Monthly rent amount in GHS"
            className="h-9 w-full rounded-md border px-3 text-sm"
          />
          {errors.monthly_rent_ghs && <p className="text-xs text-red-600">{errors.monthly_rent_ghs.message}</p>}
          <select {...register('status')} className="h-9 w-full rounded-md border px-3 text-sm">
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="unavailable">Unavailable</option>
          </select>
          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>

        <div className="flex justify-end gap-2">
          <Link href={`/app/units/${params.id}`}><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" loading={isPending}>Save Changes</Button>
        </div>
      </form>
    </div>
  )
}

export default function EditUnitPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><EditUnitInner /></RoleGate>
}
