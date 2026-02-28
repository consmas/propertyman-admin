'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { unitsEndpoints } from '@/lib/api/endpoints/units'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toCents } from '@/lib/utils'

const UNIT_TYPE_OPTIONS = [
  { value: 'chamber_and_hall_self_contain', label: 'Chamber & Hall Self Contain' },
  { value: 'one_bedroom_self_contain', label: '1 Bedroom Self Contain' },
  { value: 'two_bedroom_self_contain', label: '2 Bedroom Self Contain' },
] as const

const schema = z.object({
  unit_number: z.string().min(1, 'Required'),
  name: z.string().min(1, 'Required'),
  unit_type: z.enum(UNIT_TYPE_OPTIONS.map((x) => x.value) as [string, ...string[]]),
  status: z.enum(['available', 'occupied', 'maintenance', 'unavailable']),
  monthly_rent_ghs: z
    .string()
    .min(1, 'Monthly rent is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Enter a valid amount'),
})

type FormValues = z.infer<typeof schema>

function NewUnitInner() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const queryClient = useQueryClient()

  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'available', unit_type: 'one_bedroom_self_contain', monthly_rent_ghs: '' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: unitsEndpoints.create,
    onSuccess: () => {
      toast.success('Unit created')
      queryClient.invalidateQueries({ queryKey: ['units'] })
      router.push('/app/units')
    },
    onError: (error) => {
      setError('root.server', { message: getErrorMessage(error) })
    },
  })

  const onSubmit = (values: FormValues) => {
    if (!propertyId) {
      setError('root.server', { message: 'Select a property first' })
      return
    }

    mutate({
      unit: {
        property_id: propertyId,
        unit_number: values.unit_number,
        name: values.name,
        unit_type: values.unit_type,
        status: values.status,
        monthly_rent_cents: toCents(Number(values.monthly_rent_ghs)),
      },
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/app/units"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <PageHeader title="New Unit" description="Add unit to selected property" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card className="p-6 space-y-4">
          <input {...register('unit_number')} placeholder="Unit number" className="h-9 w-full rounded-md border px-3 text-sm" />
          {errors.unit_number && <p className="text-xs text-red-600">{errors.unit_number.message}</p>}

          <input {...register('name')} placeholder="Block number (e.g. Block A - 02)" className="h-9 w-full rounded-md border px-3 text-sm" />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}

          <select {...register('unit_type')} className="h-9 w-full rounded-md border px-3 text-sm">
            {UNIT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {errors.unit_type && <p className="text-xs text-red-600">{errors.unit_type.message}</p>}

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
          <Link href="/app/units"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" loading={isPending}>Create Unit</Button>
        </div>
      </form>
    </div>
  )
}

export default function NewUnitPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}><NewUnitInner /></RoleGate>
}
