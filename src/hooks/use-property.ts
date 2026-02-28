'use client'

import { usePropertyStore } from '@/store/property'
import { useQuery } from '@tanstack/react-query'
import { propertiesEndpoints } from '@/lib/api/endpoints/properties'
import type { ApiProperty } from '@/types/api'

export function useCurrentPropertyId(): string | null {
  return usePropertyStore(s => s.currentPropertyId)
}

export function useCurrentProperty() {
  return usePropertyStore(s => s.getCurrentProperty())
}

export function usePropertyList() {
  const setProperties = usePropertyStore(s => s.setProperties)

  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await propertiesEndpoints.list({ per_page: 100 })
      const data = res.data as ApiProperty[]
      setProperties(
        data.map(p => ({
          id: p.id,
          name: p.name,
          address: p.address ?? p.address_line_1 ?? '',
          total_units: p.total_units,
          occupied_units: p.occupied_units,
          status: p.status ?? (p.active === false ? 'inactive' : 'active'),
        }))
      )
      return data
    },
    staleTime: 60_000,
  })
}
