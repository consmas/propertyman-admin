'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Building2,
  Home,
  FileText,
  CreditCard,
  Receipt,
  Droplets,
  Logs,
  Wrench,
  LogOut,
  Settings,
  X,
} from 'lucide-react'
import { LogoLockupDark } from '@/components/shared/logo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { PropertySwitcher } from './property-switcher'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { UserRole } from '@/types/api'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles?: UserRole[]
}

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  { label: 'Overview', items: [{ href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'People',
    items: [
      { href: '/app/users', label: 'Users', icon: Users, roles: ['owner', 'admin'] },
      { href: '/app/memberships', label: 'Memberships', icon: Users, roles: ['owner', 'admin'] },
      { href: '/app/tenants', label: 'Tenants', icon: Users, roles: ['owner', 'admin', 'property_manager'] },
    ],
  },
  {
    label: 'Properties',
    items: [
      { href: '/app/properties', label: 'Properties', icon: Building2, roles: ['owner', 'admin', 'property_manager'] },
      { href: '/app/units', label: 'Units', icon: Home, roles: ['owner', 'admin', 'property_manager', 'caretaker'] },
    ],
  },
  {
    label: 'Leasing',
    items: [
      { href: '/app/leases', label: 'Leases', icon: FileText, roles: ['owner', 'admin', 'property_manager'] },
      { href: '/app/rent-installments', label: 'Installments', icon: Receipt, roles: ['owner', 'admin', 'property_manager', 'accountant'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/app/invoices', label: 'Invoices', icon: Receipt, roles: ['owner', 'admin', 'property_manager', 'accountant'] },
      { href: '/app/payments', label: 'Payments', icon: CreditCard, roles: ['owner', 'admin', 'accountant', 'property_manager'] },
      { href: '/app/payment-allocations', label: 'Allocations', icon: CreditCard, roles: ['owner', 'admin', 'accountant'] },
      { href: '/app/billing/water', label: 'Billing', icon: Receipt, roles: ['owner', 'admin', 'accountant'] },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/app/maintenance', label: 'Maintenance', icon: Wrench, roles: ['owner', 'admin', 'property_manager', 'caretaker'] },
      { href: '/app/meter-readings', label: 'Meter Readings', icon: Droplets, roles: ['owner', 'admin', 'property_manager', 'caretaker'] },
      { href: '/app/pump-topups', label: 'Pump Topups', icon: Droplets, roles: ['owner', 'admin', 'property_manager', 'caretaker'] },
    ],
  },
  {
    label: 'System',
    items: [{ href: '/app/audit-logs', label: 'Audit Logs', icon: Logs, roles: ['owner', 'admin', 'accountant'] }],
  },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.roles) return true
        if (!user?.role) return false
        return item.roles.includes(user.role)
      }),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <div
      className="flex h-full w-64 flex-col"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      {/* Close button (mobile) */}
      {onClose && (
        <button
          className="absolute right-4 top-4 lg:hidden"
          onClick={onClose}
          style={{ color: 'var(--sidebar-text)' }}
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Logo */}
      <div className="px-5 py-5">
        <LogoLockupDark iconSize={32} subtitle="Admin Dashboard" />
      </div>

      {/* Property switcher */}
      <div className="border-b px-3 pb-4" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="[&_button]:text-white [&_button:hover]:bg-white/8 [&_p]:text-white [&_.text-\[var\(--text-secondary\)\]]:!text-white/55 [&_.text-\[var\(--text-primary\)\]]:!text-white [&_.text-\[var\(--text-tertiary\)\]]:!text-white/40">
          <PropertySwitcher />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p
              className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.1em]"
              style={{ color: 'var(--sidebar-section)' }}
            >
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors',
                      isActive
                        ? 'font-semibold'
                        : ''
                    )}
                    style={{
                      background: isActive ? 'var(--sidebar-active)' : 'transparent',
                      color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'var(--sidebar-hover)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div
        className="space-y-0.5 border-t px-3 pb-2 pt-3"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <Link
          href="/app/settings"
          className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors"
          style={{ color: 'var(--sidebar-text)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sidebar-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Link
          href="/logout"
          onClick={onClose}
          className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors"
          style={{ color: 'rgba(239,68,68,0.7)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Link>
      </div>

      {/* User info */}
      {user && (
        <div
          className="border-t px-3 py-3"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <div className="flex items-center gap-3 rounded-[10px] px-2 py-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback
                className="text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-400))', color: '#fff' }}
              >
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white leading-tight">
                {user.full_name}
              </p>
              <p className="truncate text-[11px] capitalize leading-tight" style={{ color: 'var(--sidebar-text)' }}>
                {user.role.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
