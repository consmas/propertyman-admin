'use client'
import { useTenantProfile } from '@/hooks/use-tenant'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { formatCurrency, getInitials } from '@/lib/utils'

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-start justify-between gap-4 py-3 last:border-0"
      style={{ borderBottom: '1px solid var(--border-default)' }}
    >
      <span
        className="text-[12px] font-bold uppercase tracking-[0.07em] shrink-0 mt-0.5 min-w-[130px]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </span>
      <span className="text-[13px] font-medium text-right" style={{ color: 'var(--text-primary)' }}>
        {children}
      </span>
    </div>
  )
}

export default function TenantProfilePage() {
  const { user } = useAuth()
  const { data: tenant, isLoading, isError } = useTenantProfile()

  if (isLoading) return <PageLoader />

  if (isError || !tenant) {
    return (
      <ErrorState
        title="Profile not found"
        message="Your tenant profile could not be loaded. Please contact your property manager."
      />
    )
  }

  const rawName = tenant.full_name ?? `${tenant.first_name ?? ''} ${tenant.last_name ?? ''}`.trim()
  const name = rawName || '\u2014'

  return (
    <div className="fade-up space-y-6 max-w-3xl">
      {/* Profile hero */}
      <Card className="p-6">
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
            <h2
              className="font-display text-[20px] font-bold leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {name}
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {tenant.email}
            </p>
            <Badge
              variant={tenant.status === 'active' ? 'success' : 'gray'}
              className="mt-2"
            >
              {tenant.status}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Personal info */}
        <Card className="p-6">
          <h3
            className="font-display text-[15px] font-semibold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Personal Information
          </h3>
          <DetailRow label="Full Name">{name}</DetailRow>
          <DetailRow label="Email">{tenant.email || '—'}</DetailRow>
          <DetailRow label="Phone">{tenant.phone || '—'}</DetailRow>
          <DetailRow label="National ID">{tenant.national_id || '—'}</DetailRow>
          <DetailRow label="Outstanding">
            <span
              className="font-display font-bold"
              style={{
                color:
                  (tenant.outstanding ?? 0) > 0 ? 'var(--error-500)' : 'var(--success-500)',
              }}
            >
              {formatCurrency(tenant.outstanding ?? 0)}
            </span>
          </DetailRow>
        </Card>

        {/* Account info */}
        <Card className="p-6">
          <h3
            className="font-display text-[15px] font-semibold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Account Information
          </h3>
          <DetailRow label="Account Email">{user?.email || '—'}</DetailRow>
          <DetailRow label="Account Name">{user?.full_name || '—'}</DetailRow>
          <DetailRow label="Role">
            <span className="capitalize">{user?.role?.replace(/_/g, ' ') || '—'}</span>
          </DetailRow>
        </Card>
      </div>
    </div>
  )
}
