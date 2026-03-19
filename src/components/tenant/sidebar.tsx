'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, CreditCard, Wrench, User, LogOut, Building2, Receipt } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
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
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-gray-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Tenant Portal</p>
          <p className="text-xs text-gray-500">PropertyManager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-emerald-600' : 'text-gray-400')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
            {getInitials(user?.full_name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <Link
          href="/logout"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Link>
      </div>
    </div>
  )
}
