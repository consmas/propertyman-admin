'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Phone, Mail, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { tenantsApi } from '@/lib/api/tenants'
import { parseSingle } from '@/lib/jsonapi'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import type { TenantAttributes } from '@/types'

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const propertyId = useCurrentPropertyId()

  const { data, isLoading } = useQuery({
    queryKey: ['tenant', propertyId, id],
    queryFn: () => tenantsApi.get(propertyId!, id),
    enabled: !!propertyId,
  })

  const tenant = data ? parseSingle<TenantAttributes>(data as never) : null

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!tenant) return null

  const balance = parseFloat(tenant.outstanding_balance)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/tenants">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title={`${tenant.first_name} ${tenant.last_name}`}
          description={tenant.email}
          actions={<StatusBadge status={tenant.status} type="tenant" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-16 w-16 mb-3">
                <AvatarFallback className="text-lg bg-indigo-100 text-indigo-700">
                  {getInitials(tenant.first_name, tenant.last_name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-gray-900">{tenant.first_name} {tenant.last_name}</h3>
              <p className="text-sm text-gray-500">{tenant.email}</p>

              {balance > 0 && (
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>Balance due: {formatCurrency(tenant.outstanding_balance)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: 'Phone', value: tenant.phone, icon: Phone },
              { label: 'Email', value: tenant.email, icon: Mail },
              { label: 'National ID', value: tenant.national_id ?? '—', icon: null },
              { label: 'Date of Birth', value: formatDate(tenant.date_of_birth), icon: null },
              { label: 'Emergency Contact', value: tenant.emergency_contact_name ?? '—', icon: null },
              { label: 'Emergency Phone', value: tenant.emergency_contact_phone ?? '—', icon: null },
              { label: 'Tenant Since', value: formatDate(tenant.created_at), icon: null },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="mt-1 text-sm text-gray-900">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/dashboard/invoices?tenant=${id}`}>
          <Button variant="outline" size="sm">View Invoices</Button>
        </Link>
        <Link href={`/dashboard/payments?tenant=${id}`}>
          <Button variant="outline" size="sm">View Payments</Button>
        </Link>
        <Link href={`/dashboard/leases?tenant=${id}`}>
          <Button variant="outline" size="sm">View Leases</Button>
        </Link>
      </div>
    </div>
  )
}
