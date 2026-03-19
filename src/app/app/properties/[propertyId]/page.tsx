'use client'

import { use, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePropertyStore } from '@/store/property'
import { ArrowLeft, Building2, Check, Copy, Home, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { propertiesEndpoints } from '@/lib/api/endpoints/properties'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { KpiCard } from '@/components/shared/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPercent } from '@/lib/utils'
import { getErrorMessage } from '@/lib/errors'
import type { ApiProperty } from '@/types/api'

export default function AppPropertyDetailPage({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const setCurrentProperty = usePropertyStore(s => s.setCurrentProperty)
  const [activeStatus, setActiveStatus] = useState<'active' | 'inactive'>('active')
  const [codeCopied, setCodeCopied] = useState(false)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['app-property', propertyId],
    queryFn: () => propertiesEndpoints.get(propertyId),
  })

  useEffect(() => {
    const next = data?.data?.status ?? (data?.data?.active === false ? 'inactive' : 'active')
    setActiveStatus(next === 'inactive' ? 'inactive' : 'active')
  }, [data])

  const property: ApiProperty | undefined = data?.data
  const derivedStatus: 'active' | 'inactive' | 'maintenance' =
    property?.status ?? (property?.active === false ? 'inactive' : 'active')

  const { mutate: deleteProperty, isPending: isDeleting } = useMutation({
    mutationFn: () => propertiesEndpoints.delete(propertyId),
    onSuccess: () => {
      toast.success('Property deleted')
      queryClient.invalidateQueries({ queryKey: ['app-properties'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      router.push('/app/properties')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: () =>
      propertiesEndpoints.update(propertyId, {
        property: {
          active: activeStatus === 'active',
          status: activeStatus,
        },
      }),
    onSuccess: () => {
      toast.success('Property status updated')
      queryClient.invalidateQueries({ queryKey: ['app-property', propertyId] })
      queryClient.invalidateQueries({ queryKey: ['app-properties'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  if (!property) return null

  const totalUnitsRaw = Number(property.total_units)
  const occupiedUnitsRaw = Number(property.occupied_units)
  const totalUnits = Number.isFinite(totalUnitsRaw) && totalUnitsRaw > 0 ? totalUnitsRaw : 0
  const occupiedUnits = Number.isFinite(occupiedUnitsRaw) && occupiedUnitsRaw >= 0
    ? Math.min(occupiedUnitsRaw, totalUnits || occupiedUnitsRaw)
    : 0
  const vacantUnits = Math.max(totalUnits - occupiedUnits, 0)

  const occupancyRate = totalUnits > 0
    ? (occupiedUnits / totalUnits) * 100
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/properties">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title={property.name}
          description={`${property.address ?? property.address_line_1 ?? 'Address not set'}, ${property.city}, ${property.state}`}
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={derivedStatus} type="property" />
              <select
                className="h-8 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-2 text-xs"
                value={activeStatus}
                onChange={(e) => setActiveStatus(e.target.value as 'active' | 'inactive')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button size="sm" onClick={() => updateStatus()} loading={isUpdatingStatus}>
                Save Status
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentProperty(property.id)}
              >
                Set as active
              </Button>
              <Button
                size="sm"
                variant="destructive"
                loading={isDeleting}
                onClick={() => {
                  if (window.confirm('Delete this property? All associated data will be removed. This cannot be undone.')) deleteProperty()
                }}
              >
                Delete
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Total Units" value={totalUnits} icon={Home} accent="#3b82f6" />
        <KpiCard title="Occupied" value={occupiedUnits} subtitle={`${formatPercent(occupancyRate)} rate`} icon={Users} />
        <KpiCard title="Vacant" value={vacantUnits} icon={Building2} accent="#f59e0b" />
      </div>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              label: 'Address',
              value: `${property.address ?? property.address_line_1 ?? '—'}, ${property.city}, ${property.state} ${property.zip_code ?? property.postal_code ?? ''}`.trim(),
            },
            { label: 'Country', value: property.country },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
              <p className="mt-1 text-sm text-gray-900">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Invite Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-500">
            Share this code with tenants so they can self-register and link their account to this property.
          </p>
          {property.code ? (
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded-md border bg-gray-50 px-4 py-2.5 font-mono text-lg font-bold tracking-widest text-gray-900 select-all">
                {property.code}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyCode(property.code!)}
                className="shrink-0 gap-1.5"
              >
                {codeCopied ? (
                  <><Check className="h-3.5 w-3.5 text-green-600" /><span className="text-green-600">Copied</span></>
                ) : (
                  <><Copy className="h-3.5 w-3.5" />Copy</>
                )}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-amber-600 font-medium">No code set for this property.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
