'use client'

import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials, humanizeStatus } from '@/lib/utils'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Manage your account preferences" />

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl bg-indigo-100 text-indigo-700">
              {getInitials(user?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {user?.full_name}
            </h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <Badge variant="default" className="mt-2">
              {humanizeStatus(user?.role ?? '')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Application</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>API Endpoint</span>
            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
              {process.env.NEXT_PUBLIC_API_BASE_URL ?? 'Not configured'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Currency</span>
            <span>{process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'GHS'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
