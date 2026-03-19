'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { TenantSidebar } from '@/components/tenant/sidebar'
import { TenantTopNav } from '@/components/tenant/top-nav'
import { PageLoader } from '@/components/shared/loading-spinner'
import { cn } from '@/lib/utils'

function TenantPortalShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <TenantSidebar onClose={() => setSidebarOpen(false)} />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TenantTopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function TenantPortalLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated, user } = useAuth()
  const router = useRouter()

  if (!isHydrated) {
    return <div className="flex h-screen items-center justify-center"><PageLoader /></div>
  }

  if (!isAuthenticated) {
    router.replace('/tenant/login')
    return <div className="flex h-screen items-center justify-center"><PageLoader /></div>
  }

  if (user?.role !== 'tenant') {
    router.replace('/app/dashboard')
    return <div className="flex h-screen items-center justify-center"><PageLoader /></div>
  }

  return <TenantPortalShell>{children}</TenantPortalShell>
}
