'use client'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getInitials } from '@/lib/utils'

function getPageTitle(pathname: string): { title: string; subtitle: string } {
  if (pathname === '/tenant/dashboard') return { title: 'Dashboard', subtitle: 'Your tenancy overview' }
  if (pathname.startsWith('/tenant/lease')) return { title: 'My Lease', subtitle: 'Lease details & schedule' }
  if (pathname.startsWith('/tenant/invoices')) return { title: 'Invoices', subtitle: 'Your billing history' }
  if (pathname.startsWith('/tenant/payments')) return { title: 'Payments', subtitle: 'Payment records' }
  if (pathname.startsWith('/tenant/maintenance')) return { title: 'Maintenance', subtitle: 'Requests & status' }
  if (pathname.startsWith('/tenant/profile')) return { title: 'My Profile', subtitle: 'Account information' }
  return { title: 'Tenant Portal', subtitle: '' }
}

export function TenantTopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const { title, subtitle } = getPageTitle(pathname)

  return (
    <header
      className="flex h-14 items-center gap-4 px-5"
      style={{
        background: 'var(--surface-primary)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <button
        onClick={onMenuClick}
        className="lg:hidden rounded-[8px] p-1.5 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="font-display text-[15px] font-bold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))' }}
      >
        {getInitials(user?.full_name)}
      </div>
    </header>
  )
}
