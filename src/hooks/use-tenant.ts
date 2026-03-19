'use client'
import { useQuery } from '@tanstack/react-query'
import { tenantsEndpoints } from '@/lib/api/endpoints/tenants'
import { useAuth } from '@/hooks/use-auth'

export function useTenantProfile() {
  const { user, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['tenant-profile', user?.id],
    queryFn: async () => {
      const res = await tenantsEndpoints.list({})
      const tenants = res.data ?? []
      // Find the tenant record belonging to the current user (by email match or user_id)
      const mine = tenants.find(
        (t) =>
          t.email?.toLowerCase() === user?.email?.toLowerCase() ||
          (t as { user_id?: string }).user_id === user?.id
      )
      if (!mine) throw new Error('Tenant profile not found')
      return mine
    },
    enabled: isAuthenticated && user?.role === 'tenant',
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
