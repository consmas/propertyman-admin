'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useHasRole } from '@/hooks/use-auth'
import type { UserRole } from '@/types/api'
import { PageLoader } from './loading-spinner'

interface RoleGateProps {
  roles: UserRole[]
  children: React.ReactNode
}

export function RoleGate({ roles, children }: RoleGateProps) {
  const router = useRouter()
  const allowed = useHasRole(...roles)

  useEffect(() => {
    if (!allowed) {
      router.replace('/app/dashboard')
    }
  }, [allowed, router])

  if (!allowed) {
    return <PageLoader />
  }

  return <>{children}</>
}
