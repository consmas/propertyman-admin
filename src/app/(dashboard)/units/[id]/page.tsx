'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { unitsApi } from '@/lib/api/units'
import { parseSingle } from '@/lib/jsonapi'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import type { UnitAttributes } from '@/types'

export default function UnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const propertyId = useCurrentPropertyId()

  const { data, isLoading } = useQuery({
    queryKey: ['unit', propertyId, id],
    queryFn: () => unitsApi.get(propertyId!, id),
    enabled: !!propertyId,
  })

  const unit = data ? parseSingle<UnitAttributes>(data as never) : null

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!unit) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/units">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title={`Unit ${unit.unit_number}`}
          actions={<StatusBadge status={unit.status} type="unit" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Details */}
        <Card>
          <CardHeader><CardTitle>Unit Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Monthly Rent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(unit.monthly_rent)}</p>
            </div>

            {unit.amenities.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {unit.amenities.map(a => (
                    <Badge key={a} variant="gray" className="capitalize">{a}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Link href={`/dashboard/leases/new?unit=${id}`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Home className="h-4 w-4" />
                Create Lease for This Unit
              </Button>
            </Link>
            <Link href={`/dashboard/maintenance?unit=${id}`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                View Maintenance Requests
              </Button>
            </Link>
            <Link href={`/dashboard/invoices?unit=${id}`}>
              <Button variant="outline" className="w-full justify-start gap-2">
                View Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
