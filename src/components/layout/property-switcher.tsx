'use client'

import { useSyncExternalStore } from 'react'
import { Building2, ChevronDown, Check } from 'lucide-react'
import { usePropertyStore } from '@/store/property'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PropertySwitcher() {
  // useSyncExternalStore is used only to read the mounted flag — the DropdownMenu
  // is always rendered so Radix's useId counter stays consistent between server
  // and client, preventing hydration mismatches in downstream components.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const { properties, currentPropertyId, setCurrentProperty, getCurrentProperty } = usePropertyStore()
  const current = getCurrentProperty()
  const ready = mounted && properties.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={!ready}>
        <Button
          variant="ghost"
          className={cn(
            'h-auto w-full justify-start gap-2 px-3 py-2 text-left font-normal',
            !ready && 'opacity-60'
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-600)]">
            <Building2 className="h-4 w-4 text-[var(--text-inverse)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)] leading-tight">
              {ready ? (current?.name ?? 'Select property') : 'Loading…'}
            </p>
            {ready && current && (
              <p className="truncate text-xs text-[var(--text-secondary)] leading-tight">{current.address}</p>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start" side="bottom">
        <DropdownMenuLabel>Your Properties</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {properties.map(property => (
          <DropdownMenuItem
            key={property.id}
            onClick={() => setCurrentProperty(property.id)}
            className="gap-3"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--brand-100)]">
              <Building2 className="h-3.5 w-3.5 text-[var(--brand-700)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{property.name}</p>
              <p className="truncate text-xs text-[var(--text-secondary)]">
                {property.occupied_units}/{property.total_units} units occupied
              </p>
            </div>
            <Check
              className={cn(
                'h-4 w-4 shrink-0',
                currentPropertyId === property.id ? 'text-[var(--brand-600)]' : 'text-transparent'
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
