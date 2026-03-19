'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, CreditCard, Wrench, User, LogOut, Building2, Receipt } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getInitials } from '@/lib/utils'

const navItems = [
  { href: '/tenant/dashboard', label: 'Dashboard', icon: Home },
  { href: '/tenant/lease', label: 'My Lease', icon: FileText },
  { href: '/tenant/invoices', label: 'Invoices', icon: Receipt },
  { href: '/tenant/payments', label: 'Payments', icon: CreditCard },
  { href: '/tenant/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/tenant/profile', label: 'Profile', icon: User },
]

export function TenantSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div
      className="flex h-full flex-col"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
    >
      {/* Logo */}
      <div
        className="flex h-16 items-center gap-3 px-5"
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))' }}
        >
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-[13px] font-bold" style={{ color: 'var(--sidebar-text-primary)' }}>
            Tenant Portal
          </p>
          <p className="text-[11px]" style={{ color: 'var(--sidebar-text-muted)' }}>
            PropertyManager
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-colors"
              style={
                active
                  ? { background: 'var(--sidebar-active-bg)', color: 'var(--sidebar-active-text)' }
                  : { color: 'var(--sidebar-text-secondary)' }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--sidebar-hover-bg)'
                  e.currentTarget.style.color = 'var(--sidebar-text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--sidebar-text-secondary)'
                }
              }}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text-muted)' }}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="p-3" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))' }}
          >
            {getInitials(user?.full_name)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--sidebar-text-primary)' }}>
              {user?.full_name}
            </p>
            <p className="text-[11px] truncate" style={{ color: 'var(--sidebar-text-muted)' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <Link
          href="/logout"
          className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors w-full"
          style={{ color: 'var(--sidebar-text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--sidebar-hover-bg)'
            e.currentTarget.style.color = 'var(--sidebar-text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--sidebar-text-secondary)'
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" style={{ color: 'var(--sidebar-text-muted)' }} />
          Sign out
        </Link>
      </div>
    </div>
  )
}
