'use client'

import Link from 'next/link'
import { Menu, Bell, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useCurrentProperty } from '@/hooks/use-property'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { PropertySwitcher } from './property-switcher'
import { useTheme } from '@/providers/theme-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface TopNavProps {
  onMenuClick: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { user } = useAuth()
  const currentProperty = useCurrentProperty()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex h-16 items-center gap-3 border-b border-[var(--border-default)] bg-[var(--surface-primary)] px-4 md:px-6">
      <button
        className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Current context breadcrumb */}
      <div className="flex-1 min-w-0">
        {currentProperty && (
          <p className="hidden truncate text-sm text-[var(--text-secondary)] sm:block">
            <span className="font-medium text-[var(--text-primary)]">{currentProperty.name}</span>
            {' · '}
            <span>{currentProperty.address}</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden w-72 lg:block [&_button]:h-10 [&_button]:border [&_button]:border-[var(--border-default)] [&_button]:bg-[var(--surface-primary)]">
          <PropertySwitcher />
        </div>
        {/* Notifications placeholder */}
        <Button variant="ghost" size="icon" className="relative text-[var(--text-secondary)]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--error-500)]" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-[var(--text-secondary)]"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-[var(--surface-tertiary)]">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">
                  {getInitials(user?.full_name)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-semibold">{user?.full_name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild destructive>
              <Link href="/logout">Sign out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
