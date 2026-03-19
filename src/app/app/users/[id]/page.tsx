'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { PageLoader } from '@/components/shared/loading-spinner'
import { ErrorState } from '@/components/shared/error-state'
import { usersEndpoints } from '@/lib/api/endpoints/users'
import { RoleGate } from '@/components/shared/role-gate'

function UserDetailInner() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', params.id],
    queryFn: () => usersEndpoints.get(params.id),
  })

  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: () => usersEndpoints.delete(params.id),
    onSuccess: () => {
      toast.success('User deleted')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      router.push('/app/users')
    },
    onError: () => toast.error('Failed to delete user'),
  })

  if (isLoading) return <PageLoader />
  if (isError || !data?.data) return <ErrorState onRetry={() => refetch()} message="Failed to load user" />

  const user = data.data

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.full_name}
        description={user.email}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/app/users/${user.id}/edit`}><Button variant="outline">Edit</Button></Link>
            <Button
              variant="destructive"
              loading={isDeleting}
              onClick={() => {
                if (window.confirm('Delete this user? This cannot be undone.')) deleteUser()
              }}
            >
              Delete
            </Button>
          </div>
        }
      />

      <Card className="p-6 space-y-2 text-sm">
        <p><span className="text-gray-500">Role:</span> {user.role}</p>
        <p><span className="text-gray-500">Status:</span> {user.status ?? 'active'}</p>
        <p><span className="text-gray-500">Phone:</span> {user.phone ?? '—'}</p>
      </Card>
    </div>
  )
}

export default function UserDetailPage() {
  return <RoleGate roles={['owner', 'admin']}><UserDetailInner /></RoleGate>
}
