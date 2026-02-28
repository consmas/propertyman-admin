'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { propertiesEndpoints } from '@/lib/api/endpoints/properties'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePropertyStore } from '@/store/property'
import { ApiError } from '@/types'
import type { ApiProperty } from '@/types/api'

const schema = z.object({
  name: z.string().min(1, 'Property name is required'),
  code: z.string().min(1, 'Property code is required'),
  address_line_1: z.string().min(1, 'Address line 1 is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Region is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

function NewPropertyInner() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const setCurrentProperty = usePropertyStore((s) => s.setCurrentProperty)

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      active: true,
      country: 'GH',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: propertiesEndpoints.create,
    onSuccess: (response) => {
      const created = response.data as ApiProperty
      toast.success('Property created')
      queryClient.invalidateQueries({ queryKey: ['app-properties'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      setCurrentProperty(created.id)
      router.push(`/app/properties/${created.id}`)
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 404) {
        setError('root.server', { message: 'Property create endpoint is not available on this API deployment.' })
        return
      }
      setError('root.server', { message: getErrorMessage(error) })
    },
  })

  const onSubmit = (values: FormValues) => {
    mutate({
      property: {
        name: values.name,
        code: values.code,
        address_line_1: values.address_line_1,
        city: values.city,
        state: values.state,
        postal_code: values.postal_code,
        country: values.country,
        active: values.active,
      },
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/properties">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader title="New Property" description="Create a property for your portfolio" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card className="space-y-4 p-6">
          <div className="space-y-1">
            <input
              {...register('name')}
              placeholder="Property name"
              className="h-9 w-full rounded-md border px-3 text-sm"
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <input
              {...register('code')}
              placeholder="Property code (e.g. ELS-HO-001)"
              className="h-9 w-full rounded-md border px-3 text-sm"
            />
            {errors.code && <p className="text-xs text-red-600">{errors.code.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <input
                {...register('address_line_1')}
                placeholder="Address line 1"
                className="h-9 w-full rounded-md border px-3 text-sm"
              />
              {errors.address_line_1 && <p className="text-xs text-red-600">{errors.address_line_1.message}</p>}
            </div>
            <div className="space-y-1">
              <input
                {...register('city')}
                placeholder="City"
                className="h-9 w-full rounded-md border px-3 text-sm"
              />
              {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <input
                {...register('state')}
                placeholder="State / Region"
                className="h-9 w-full rounded-md border px-3 text-sm"
              />
              {errors.state && <p className="text-xs text-red-600">{errors.state.message}</p>}
            </div>
            <div className="space-y-1">
              <input
                {...register('postal_code')}
                placeholder="Postal code"
                className="h-9 w-full rounded-md border px-3 text-sm"
              />
              {errors.postal_code && <p className="text-xs text-red-600">{errors.postal_code.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <input
                {...register('country')}
                placeholder="Country code (e.g. GH)"
                className="h-9 w-full rounded-md border px-3 text-sm"
              />
              {errors.country && <p className="text-xs text-red-600">{errors.country.message}</p>}
            </div>
            <div className="space-y-1">
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <select
                    className="h-9 w-full rounded-md border px-3 text-sm"
                    value={field.value ? 'true' : 'false'}
                    onChange={(e) => field.onChange(e.target.value === 'true')}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                )}
              />
              {errors.active && <p className="text-xs text-red-600">{errors.active.message}</p>}
            </div>
          </div>

          {errors.root?.server && <p className="text-sm text-red-600">{errors.root.server.message}</p>}
        </Card>

        <div className="flex justify-end gap-2">
          <Link href="/app/properties">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" loading={isPending}>Create Property</Button>
        </div>
      </form>
    </div>
  )
}

export default function NewPropertyPage() {
  return (
    <RoleGate roles={['owner', 'admin']}>
      <NewPropertyInner />
    </RoleGate>
  )
}
