'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { TopNav } from '@/components/layout/top-nav'
import { useAuth } from '@/hooks/use-auth'
import { usePropertyList } from '@/hooks/use-property'
import { PageLoader } from '@/components/shared/loading-spinner'
import { cn } from '@/lib/utils'

function AppShell({ children }: { children: React.ReactNode }) {
  usePropertyList()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-secondary)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--surface-overlay)] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1440px] space-y-6 p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isHydrated } = useAuth()

  if (!isHydrated || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageLoader />
      </div>
    )
  }

  return <AppShell>{children}</AppShell>
}
