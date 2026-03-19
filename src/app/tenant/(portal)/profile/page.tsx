'use client'
import { useTenantProfile } from '@/hooks/use-tenant'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorState } from '@/components/shared/error-state'

export default function TenantProfilePage() {
  const { user } = useAuth()
  const { data: tenant, isLoading, isError } = useTenantProfile()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
        Loading profile…
      </div>
    )
  }

  if (isError || !tenant) {
    return (
      <ErrorState
        title="Profile not found"
        message="Your tenant profile could not be loaded. Please contact your property manager."
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Your personal and account information" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Personal info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Personal Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Full Name</p>
              <p className="mt-1 text-sm text-gray-900">{tenant.full_name ?? (`${tenant.first_name ?? ''} ${tenant.last_name ?? ''}`.trim() || '—')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email</p>
              <p className="mt-1 text-sm text-gray-900">{tenant.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Phone</p>
              <p className="mt-1 text-sm text-gray-900">{tenant.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">National ID</p>
              <p className="mt-1 text-sm text-gray-900">{tenant.national_id || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Status</p>
              <p className="mt-1 text-sm text-gray-900 capitalize">{tenant.status}</p>
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Account Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Account Email</p>
              <p className="mt-1 text-sm text-gray-900">{user?.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Account Name</p>
              <p className="mt-1 text-sm text-gray-900">{user?.full_name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Role</p>
              <p className="mt-1 text-sm text-gray-900 capitalize">{user?.role?.replace(/_/g, ' ') || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Outstanding Balance</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {typeof tenant.outstanding === 'number'
                  ? new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(tenant.outstanding)
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
