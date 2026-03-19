'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, CreditCard, Home, FileText, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { tenantsEndpoints } from '@/lib/api/endpoints/tenants'
import { leasesEndpoints } from '@/lib/api/endpoints/leases'
import { unitsEndpoints } from '@/lib/api/endpoints/units'
import { RoleGate } from '@/components/shared/role-gate'
import { KpiCard } from '@/components/shared/kpi-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'

const STATUS_VARIANT: Record<string, 'success' | 'gray' | 'danger'> = {
  active: 'success',
  inactive: 'gray',
  archived: 'danger',
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[var(--border-default)] last:border-0">
      <span className="text-[12px] font-bold uppercase tracking-[0.07em] text-[var(--text-tertiary)] shrink-0 mt-0.5 min-w-[130px]">
        {label}
      </span>
      <span className="text-[13px] text-[var(--text-primary)] font-medium text-right">{children}</span>
    </div>
  )
}

function TenantDetailInner() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tenants', params.id],
    queryFn: () => tenantsEndpoints.get(params.id),
  })
  const leasesQ = useQuery({
    queryKey: ['leases', 'tenant-detail', params.id],
    queryFn: () => leasesEndpoints.list({ tenant_id: params.id, status: 'active', per_page: 20 }),
    enabled: Boolean(params.id),
  })
  const activeLease = (leasesQ.data?.data ?? [])[0]
  const assignedUnitQ = useQuery({
    queryKey: ['units', 'tenant-detail', activeLease?.unit_id],
    queryFn: () => unitsEndpoints.get(activeLease!.unit_id),
    enabled: Boolean(activeLease?.unit_id),
  })

  const { mutate: deleteTenant, isPending: isDeleting } = useMutation({
    mutationFn: () => tenantsEndpoints.delete(params.id),
    onSuccess: () => {
      toast.success('Tenant deleted')
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      router.push('/app/tenants')
    },
    onError: () => toast.error('Failed to delete tenant'),
  })

  if (isLoading) return <PageLoader />
  if (isError || !data?.data)
    return <ErrorState message="Failed to load tenant" onRetry={() => refetch()} />

  const tenant = data.data
  const name = tenant.full_name ?? `${tenant.first_name ?? ''} ${tenant.last_name ?? ''}`.trim()
  const assignedUnit = assignedUnitQ.data?.data

  return (
    <div className="fade-up space-y-6 max-w-4xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-3">
        <Link href="/app/tenants">
          <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--text-secondary)]">
            <ArrowLeft className="h-4 w-4" />
            Tenants
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/app/tenants/${tenant.id}/edit`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="destructive"
            loading={isDeleting}
            onClick={() => {
              if (window.confirm('Delete this tenant? This cannot be undone.')) deleteTenant()
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Profile hero */}
      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-2xl">
              <AvatarFallback
                className="rounded-2xl text-xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))',
                  color: '#fff',
                }}
              >
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-[20px] font-bold text-[var(--text-primary)] leading-tight">
                {name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-[13px] text-[var(--text-secondary)]">
                {tenant.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {tenant.email}
                  </span>
                )}
                {tenant.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {tenant.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge variant={STATUS_VARIANT[tenant.status] ?? 'gray'} className="self-start sm:self-auto text-sm px-3 py-1">
            {tenant.status}
          </Badge>
        </div>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Outstanding Balance"
          value={formatCurrency(tenant.outstanding)}
          subtitle={tenant.outstanding > 0 ? 'Requires payment' : 'Fully settled'}
          icon={CreditCard}
          accent={tenant.outstanding > 0 ? '#ef4444' : '#10b981'}
          delay={0}
        />
        <KpiCard
          title="Current Unit"
          value={
            assignedUnitQ.isLoading
              ? '…'
              : assignedUnit
              ? assignedUnit.unit_number
              : 'Unassigned'
          }
          subtitle={assignedUnit?.name ?? (assignedUnitQ.isLoading ? '' : 'No active lease')}
          icon={Home}
          accent="#3b82f6"
          delay={80}
        />
        <KpiCard
          title="Active Lease"
          value={activeLease ? 'Yes' : 'None'}
          subtitle={
            activeLease
              ? `Ends ${formatDate(activeLease.end_date)}`
              : 'No active lease found'
          }
          icon={FileText}
          accent="#8b5cf6"
          delay={160}
        />
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Contact & identity */}
        <Card className="p-6">
          <h3 className="font-display text-[15px] font-semibold text-[var(--text-primary)] mb-4">
            Tenant Information
          </h3>
          <DetailRow label="Full Name">{name}</DetailRow>
          <DetailRow label="Email">{tenant.email}</DetailRow>
          <DetailRow label="Phone">{tenant.phone || '—'}</DetailRow>
          <DetailRow label="National ID">{tenant.national_id || '—'}</DetailRow>
          <DetailRow label="Status">
            <Badge variant={STATUS_VARIANT[tenant.status] ?? 'gray'}>{tenant.status}</Badge>
          </DetailRow>
          <DetailRow label="Created">{formatDate(tenant.created_at)}</DetailRow>
        </Card>

        {/* Lease summary */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-[15px] font-semibold text-[var(--text-primary)]">
              Active Lease
            </h3>
            <Link href={`/app/leases/new`}>
              <Button variant="outline" size="sm">
                New Lease
              </Button>
            </Link>
          </div>

          {leasesQ.isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          )}

          {!leasesQ.isLoading && !activeLease && (
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-8 text-center">
              <FileText className="mx-auto mb-2 h-8 w-8 text-[var(--text-tertiary)]" />
              <p className="text-[13px] font-medium text-[var(--text-secondary)]">No active lease</p>
              <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
                Create a lease to assign this tenant to a unit.
              </p>
            </div>
          )}

          {activeLease && (
            <>
              <DetailRow label="Unit">
                {assignedUnitQ.isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : assignedUnit ? (
                  `${assignedUnit.unit_number}${assignedUnit.name ? ` — ${assignedUnit.name}` : ''}`
                ) : (
                  activeLease.unit_id
                )}
              </DetailRow>
              <DetailRow label="Start Date">{formatDate(activeLease.start_date)}</DetailRow>
              <DetailRow label="End Date">{formatDate(activeLease.end_date)}</DetailRow>
              <DetailRow label="Monthly Rent">
                <span className="font-display font-bold text-[var(--brand-600)]">
                  {formatCurrency(activeLease.rent)}
                </span>
              </DetailRow>
              <DetailRow label="Status">
                <Badge variant="success">{activeLease.status}</Badge>
              </DetailRow>
              <div className="mt-4">
                <Link href={`/app/leases/${activeLease.id}`}>
                  <Button variant="outline" size="sm" className="w-full gap-1.5">
                    <FileText className="h-4 w-4" />
                    View Full Lease
                  </Button>
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* IDs */}
      <Card className="px-6 py-4">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.07em] text-[var(--text-tertiary)]">
          Record IDs
        </p>
        <p className="font-mono text-[12px] text-[var(--text-secondary)]">
          Tenant: {tenant.id}
        </p>
        {tenant.property_id && (
          <p className="font-mono text-[12px] text-[var(--text-secondary)]">
            Property: {tenant.property_id}
          </p>
        )}
      </Card>
    </div>
  )
}

export default function TenantDetailPage() {
  return (
    <RoleGate roles={['owner', 'admin', 'property_manager']}>
      <TenantDetailInner />
    </RoleGate>
  )
}
