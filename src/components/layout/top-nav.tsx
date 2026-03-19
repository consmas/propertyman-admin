'use client'

import Link from 'next/link'
import { Menu, Bell, Moon, Sun, Search } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { useTheme } from '@/providers/theme-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface TopNavProps {
  onMenuClick: () => void
}

// Map route segments to readable page titles
function getPageTitle(pathname: string): { title: string; sub: string } {
  const segments = pathname.split('/').filter(Boolean)
  const last = segments[segments.length - 1]

  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    properties: 'Properties',
    units: 'Units',
    tenants: 'Tenants',
    leases: 'Leases',
    payments: 'Payments',
    invoices: 'Invoices',
    maintenance: 'Maintenance',
    'meter-readings': 'Meter Readings',
    'pump-topups': 'Pump Topups',
    'rent-installments': 'Installments',
    'payment-allocations': 'Allocations',
    'audit-logs': 'Audit Logs',
    users: 'Users',
    memberships: 'Memberships',
    settings: 'Settings',
    billing: 'Billing',
    new: 'New',
  }

  // Detail page (UUID segment)
  const isUuid = /^[0-9a-f-]{36}$/.test(last)
  if (isUuid) {
    const parent = segments[segments.length - 2]
    return {
      title: map[parent] ?? 'Detail',
      sub: 'Record detail',
    }
  }

  const subs: Record<string, string> = {
    dashboard: 'Portfolio overview',
    properties: 'Manage your properties',
    units: 'All rental units',
    tenants: 'Tenant management',
    leases: 'Active lease agreements',
    payments: 'Payment records',
    invoices: 'Invoice management',
    maintenance: 'Maintenance requests',
    'meter-readings': 'Utility meter readings',
    'pump-topups': 'Water pump topups',
    'rent-installments': 'Rent schedule',
    'payment-allocations': 'Payment allocations',
    'audit-logs': 'System activity log',
    users: 'Team members',
    memberships: 'Property memberships',
    settings: 'Account & preferences',
    billing: 'Utility billing',
    new: 'Create new record',
  }

  return {
    title: map[last] ?? 'Dashboard',
    sub: subs[last] ?? 'Property management',
  }
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  const { title, sub } = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-10 flex h-[65px] items-center gap-4 border-b bg-[var(--surface-primary)] px-4 md:px-6"
      style={{ borderColor: 'var(--border-default)' }}>

      {/* Mobile menu */}
      <button
        className="rounded-[10px] p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] lg:hidden transition-colors"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0 hidden md:block">
        <h1 className="font-display text-[18px] font-bold leading-tight tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="text-[12px] text-[var(--text-tertiary)] leading-tight mt-0.5">{sub}</p>
      </div>

      {/* Mobile: page title */}
      <div className="flex-1 min-w-0 md:hidden">
        <h1 className="font-display text-[16px] font-bold text-[var(--text-primary)] truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search bar (desktop) */}
        <div
          className="hidden lg:flex items-center gap-2 rounded-[10px] border px-3 py-2 w-52 cursor-text text-[var(--text-tertiary)] text-[13px]"
          style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)' }}
        >
          <Search className="h-4 w-4 shrink-0" />
          <span>Search…</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-[10px] text-[var(--text-secondary)]"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[var(--surface-primary)]"
              style={{ background: '#ef4444' }}
            />
          </Button>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-[10px] text-[var(--text-secondary)]"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {mounted ? (
            theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />
          ) : (
            <span className="h-[18px] w-[18px]" />
          )}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2.5 rounded-[10px] px-2 py-1.5 transition-colors hover:bg-[var(--surface-tertiary)]"
              aria-label="User menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs font-bold">
                  {getInitials(user?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight">
                  {user?.full_name?.split(' ')[0]}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-semibold">{user?.full_name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild destructive>
              <Link href="/logout">Sign out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
