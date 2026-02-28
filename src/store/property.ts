import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PropertyAttributes } from '@/types'

export interface PropertyOption {
  id: string
  name: string
  address: string
  total_units: number
  occupied_units: number
  status: PropertyAttributes['status']
}

interface PropertyStore {
  currentPropertyId: string | null
  properties: PropertyOption[]

  setCurrentProperty: (id: string) => void
  setProperties: (properties: PropertyOption[]) => void
  getCurrentProperty: () => PropertyOption | null
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      currentPropertyId: null,
      properties: [],

      setCurrentProperty: (id) => set({ currentPropertyId: id }),

      setProperties: (properties) => {
        const state = get()
        set({
          properties,
          // Auto-select first property if none selected or current no longer exists
          currentPropertyId:
            state.currentPropertyId && properties.some(p => p.id === state.currentPropertyId)
              ? state.currentPropertyId
              : properties[0]?.id ?? null,
        })
      },

      getCurrentProperty: () => {
        const { currentPropertyId, properties } = get()
        return properties.find(p => p.id === currentPropertyId) ?? null
      },
    }),
    {
      name: 'property-store',
      partialize: (state) => ({ currentPropertyId: state.currentPropertyId }),
    }
  )
)
