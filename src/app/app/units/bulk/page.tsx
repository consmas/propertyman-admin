'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { unitsEndpoints } from '@/lib/api/endpoints/units'
import { useCurrentProperty, useCurrentPropertyId } from '@/hooks/use-property'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

const UNIT_TYPE_OPTIONS = [
  { value: 'chamber_and_hall_self_contain', label: 'Chamber & Hall Self Contain' },
  { value: 'one_bedroom_self_contain', label: '1 Bedroom Self Contain' },
  { value: 'two_bedroom_self_contain', label: '2 Bedroom Self Contain' },
] as const

const schema = z.object({
  prefix: z.string().min(1, 'Required'),
  start: z.coerce.number().int().min(1, 'Min 1').max(999),
  count: z.coerce.number().int().min(1, 'Min 1').max(100, 'Max 100 at once'),
  unit_type: z.enum(UNIT_TYPE_OPTIONS.map((x) => x.value) as [string, ...string[]]),
  monthly_rent: z.string().min(1, 'Required').refine(
    (v) => !Number.isNaN(Number(v)) && Number(v) >= 0,
    'Enter a valid amount'
  ),
  status: z.enum(['available', 'occupied', 'maintenance', 'unavailable']),
})

type FormValues = z.infer<typeof schema>

type PreviewUnit = {
  unit_number: string
  name: string
  unit_type: string
  status: string
  monthly_rent: number
  removed: boolean
}

function BulkUnitsInner() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const currentProperty = useCurrentProperty()
  const queryClient = useQueryClient()
  const [preview, setPreview] = useState<PreviewUnit[] | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      prefix: 'A',
      start: 1,
      count: 10,
      unit_type: 'chamber_and_hall_self_contain',
      monthly_rent: '',
      status: 'available',
    },
  })

  const watched = watch()

  const generatePreview = (values: FormValues) => {
    const rent = Number(values.monthly_rent)
    const units: PreviewUnit[] = []
    for (let i = 0; i < values.count; i++) {
      const num = values.start + i
      const padded = String(num).padStart(2, '0')
      const unit_number = `${values.prefix}-${padded}`
      units.push({
        unit_number,
        name: unit_number,
        unit_type: values.unit_type,
        status: values.status,
        monthly_rent: rent,
        removed: false,
      })
    }
    setPreview(units)
    setServerError(null)
  }

  const toggleRemove = (idx: number) => {
    setPreview((prev) =>
      prev ? prev.map((u, i) => (i === idx ? { ...u, removed: !u.removed } : u)) : prev
    )
  }

  const { mutate, isPending } = useMutation({
    mutationFn: unitsEndpoints.bulkCreate,
    onSuccess: (res) => {
      const count = Array.isArray(res.data) ? res.data.length : 0
      toast.success(`${count} unit${count === 1 ? '' : 's'} created`)
      queryClient.invalidateQueries({ queryKey: ['units'] })
      router.push('/app/units')
    },
    onError: (error) => {
      setServerError(getErrorMessage(error))
    },
  })

  const activeUnits = useMemo(() => preview?.filter((u) => !u.removed) ?? [], [preview])

  const handleConfirm = () => {
    if (!propertyId) {
      setServerError('Select a property first')
      return
    }
    if (activeUnits.length === 0) {
      setServerError('No units to create — restore at least one.')
      return
    }
    mutate({
      property_id: propertyId,
      units: activeUnits.map(({ unit_number, name, unit_type, status, monthly_rent }) => ({
        unit_number,
        name,
        unit_type,
        status,
        monthly_rent,
      })),
    })
  }

  const unitTypeLabel = (v: string) =>
    UNIT_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/app/units">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title="Bulk Add Units"
          description={currentProperty ? `Adding to: ${currentProperty.name}` : 'Generate multiple units at once for the selected property'}
        />
      </div>

      {/* Generator form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(generatePreview)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Prefix</label>
              <input
                {...register('prefix')}
                placeholder="e.g. A, B, Block-1"
                className="h-9 w-full rounded-md border px-3 text-sm"
              />
              {errors.prefix && <p className="text-xs text-red-600 mt-1">{errors.prefix.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Start number</label>
              <input
                {...register('start')}
                type="number"
                min={1}
                className="h-9 w-full rounded-md border px-3 text-sm"
              />
              {errors.start && <p className="text-xs text-red-600 mt-1">{errors.start.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Count</label>
              <input
                {...register('count')}
                type="number"
                min={1}
                max={100}
                className="h-9 w-full rounded-md border px-3 text-sm"
              />
              {errors.count && <p className="text-xs text-red-600 mt-1">{errors.count.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Unit type</label>
              <select {...register('unit_type')} className="h-9 w-full rounded-md border px-3 text-sm">
                {UNIT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Monthly rent (GHS)</label>
              <input
                {...register('monthly_rent')}
                type="number"
                step="0.01"
                placeholder="e.g. 800"
                className="h-9 w-full rounded-md border px-3 text-sm"
              />
              {errors.monthly_rent && <p className="text-xs text-red-600 mt-1">{errors.monthly_rent.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
              <select {...register('status')} className="h-9 w-full rounded-md border px-3 text-sm">
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="outline">Preview units</Button>
          </div>
        </form>
      </Card>

      {/* Preview table */}
      {preview && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">
                Preview — {activeUnits.length} of {preview.length} units will be created
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Click the trash icon to exclude a unit from the batch.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-gray-500 uppercase">
                  <th className="py-2 text-left font-medium">Unit #</th>
                  <th className="py-2 text-left font-medium">Type</th>
                  <th className="py-2 text-left font-medium">Rent</th>
                  <th className="py-2 text-left font-medium">Status</th>
                  <th className="py-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {preview.map((unit, idx) => (
                  <tr
                    key={idx}
                    className={`border-b last:border-0 transition-opacity ${unit.removed ? 'opacity-30 line-through' : ''}`}
                  >
                    <td className="py-2 font-mono font-medium">{unit.unit_number}</td>
                    <td className="py-2 text-gray-600">{unitTypeLabel(unit.unit_type)}</td>
                    <td className="py-2">{formatCurrency(unit.monthly_rent)}</td>
                    <td className="py-2 capitalize">{unit.status}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => toggleRemove(idx)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title={unit.removed ? 'Restore' : 'Remove'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {serverError && (
            <p className="text-sm text-red-600">{serverError}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setPreview(null)}>
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              loading={isPending}
              disabled={activeUnits.length === 0}
            >
              Create {activeUnits.length} unit{activeUnits.length === 1 ? '' : 's'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function BulkUnitsPage() {
  return (
    <RoleGate roles={['owner', 'admin', 'property_manager', 'caretaker']}>
      <BulkUnitsInner />
    </RoleGate>
  )
}
