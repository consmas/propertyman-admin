'use client'

import { useState, useEffect } from 'react'
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
          <div className="mx-auto max-w-[1400px] space-y-6 p-5 md:p-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isHydrated } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Keep server and initial client render identical to avoid hydration mismatch.
  // After mount, switch to the real shell (client-only update, no hydration involved).
  if (!mounted || !isHydrated || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--surface-secondary)]">
        <PageLoader />
      </div>
    )
  }

  return <AppShell>{children}</AppShell>
}
