'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { PageLoader } from '@/components/shared/loading-spinner'

export default function LogoutPage() {
  const router = useRouter()
  const logout = useAuthStore(s => s.logout)
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    logout().then(() => {
      router.replace('/login')
    })
  }, [logout, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <PageLoader />
        <p className="text-sm">Signing out…</p>
      </div>
    </div>
  )
}
