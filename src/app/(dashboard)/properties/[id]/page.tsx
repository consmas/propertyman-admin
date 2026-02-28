'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Home, Users, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { propertiesApi } from '@/lib/api/properties'
import { parseSingle } from '@/lib/jsonapi'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { KpiCard } from '@/components/shared/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPercent } from '@/lib/utils'
import type { PropertyAttributes } from '@/types'

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.get(id),
  })

  const property = data ? parseSingle<PropertyAttributes>(data as never) : null

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  if (!property) return null

  const occupancyRate = property.total_units > 0
    ? (property.occupied_units / property.total_units) * 100
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/properties">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <PageHeader
            title={property.name}
            description={`${property.address}, ${property.city}, ${property.state}`}
            actions={<StatusBadge status={property.status} type="property" />}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Units"
          value={property.total_units}
          icon={Home}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          title="Occupied Units"
          value={property.occupied_units}
          subtitle={formatPercent(occupancyRate) + ' occupancy'}
          icon={Users}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <KpiCard
          title="Vacant Units"
          value={property.total_units - property.occupied_units}
          icon={Building2}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <KpiCard
          title="Documents"
          value="—"
          icon={FileText}
          iconBg="bg-gray-50"
          iconColor="text-gray-600"
        />
      </div>

      {/* Details card */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: 'Full Address', value: `${property.address}, ${property.city}, ${property.state} ${property.zip_code}` },
            { label: 'Country', value: property.country },
            { label: 'Status', value: <StatusBadge status={property.status} type="property" /> },
            { label: 'Occupancy Rate', value: formatPercent(occupancyRate) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
              <p className="mt-1 text-sm text-gray-900">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { href: `/dashboard/units?property=${id}`, label: 'View Units', icon: Home },
          { href: `/dashboard/tenants?property=${id}`, label: 'View Tenants', icon: Users },
          { href: `/dashboard/invoices?property=${id}`, label: 'View Invoices', icon: FileText },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <Icon className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
