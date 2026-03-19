'use client'
import { Menu } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getInitials } from '@/lib/utils'

export function TenantTopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth()
  return (
    <header className="flex h-14 items-center border-b border-gray-200 bg-white px-4 gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
        {getInitials(user?.full_name)}
      </div>
    </header>
  )
}
