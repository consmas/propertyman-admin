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
  X,
} from 'lucide-react'
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
    <div className="pm-sidebar flex h-full w-64 flex-col bg-[var(--surface-sidebar)]">
      {/* Close button (mobile) */}
      {onClose && (
        <button
          className="absolute right-4 top-4 text-[var(--neutral-400)] hover:text-[var(--text-inverse)] lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Property switcher */}
      <div className="border-b border-[var(--neutral-700)]/60 p-3">
        <div className="[&_button]:text-[var(--text-inverse)] [&_button:hover]:bg-[var(--neutral-800)] [&_p]:text-[var(--text-inverse)] [&_.text-gray-500]:text-[var(--neutral-400)]">
          <PropertySwitcher />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {visibleGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--neutral-400)]">
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--brand-600)] text-[var(--text-inverse)]'
                      : 'text-[var(--neutral-300)] hover:bg-[var(--neutral-800)] hover:text-[var(--text-inverse)]'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="space-y-1 border-t border-[var(--neutral-700)]/60 p-3">
        <Link
          href="/logout"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--neutral-300)] transition-colors hover:bg-[var(--neutral-800)] hover:text-[var(--error-500)]"
          onClick={onClose}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Link>

        {/* User info */}
        {user && (
          <div className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[var(--brand-700)] text-[var(--brand-100)] text-xs">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[var(--text-inverse)]">{user.full_name}</p>
              <p className="truncate text-xs capitalize text-[var(--neutral-400)]">{user.role.replace(/_/g, ' ')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
