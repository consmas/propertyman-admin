'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, Wrench, Clock } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { maintenanceApi } from '@/lib/api/maintenance'
import { unitsApi } from '@/lib/api/units'
import { parseList } from '@/lib/jsonapi'
import { createMaintenanceSchema, type CreateMaintenanceFormValues } from '@/lib/validations/maintenance'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatDate, humanizeStatus } from '@/lib/utils'
import type { MaintenanceAttributes, UnitAttributes } from '@/types'

type MaintenanceRow = MaintenanceAttributes & { id: string }

function AgingIndicator({ reportedDate, status }: { reportedDate: string; status: string }) {
  if (status === 'resolved' || status === 'closed') return null
  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <Clock className="h-3 w-3" />
      {formatDistanceToNow(parseISO(reportedDate), { addSuffix: false })} old
    </span>
  )
}

const columns: Column<MaintenanceRow>[] = [
  {
    key: 'title',
    header: 'Request',
    render: (row) => (
      <div>
        <p className="font-medium text-gray-900">{row.title}</p>
        <AgingIndicator reportedDate={row.reported_date} status={row.status} />
      </div>
    ),
  },
  {
    key: 'category',
    header: 'Category',
    render: (row) => <span className="capitalize">{humanizeStatus(row.category)}</span>,
  },
  {
    key: 'priority',
    header: 'Priority',
    render: (row) => <StatusBadge status={row.priority} type="maintenance_priority" />,
  },
  {
    key: 'reported_date',
    header: 'Reported',
    render: (row) => formatDate(row.reported_date),
  },
  {
    key: 'assigned_to',
    header: 'Assigned To',
    render: (row) => <span className="text-gray-500">{row.assigned_to ?? 'Unassigned'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} type="maintenance" />,
  },
]

export default function MaintenancePage() {
  const router = useRouter()
  const propertyId = useCurrentPropertyId()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', propertyId, statusFilter, page],
    queryFn: () =>
      maintenanceApi.list(propertyId!, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        per_page: 25,
      }),
    enabled: !!propertyId,
  })

  const { data: unitsData } = useQuery({
    queryKey: ['units', propertyId],
    queryFn: () => unitsApi.list(propertyId!, { per_page: 100 }),
    enabled: !!propertyId,
  })

  const units = unitsData ? parseList<UnitAttributes>(unitsData as never).data : []
  const { data: rows, meta } = data
    ? parseList<MaintenanceAttributes>(data as never)
    : { data: [], meta: {} }

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateMaintenanceFormValues>({
    resolver: zodResolver(createMaintenanceSchema),
    defaultValues: { priority: 'medium', category: 'other' },
  })

  const mutation = useMutation({
    mutationFn: (values: CreateMaintenanceFormValues) =>
      maintenanceApi.create(propertyId!, { ...values, property_id: propertyId! }),
    onSuccess: () => {
      toast.success('Maintenance request created')
      queryClient.invalidateQueries({ queryKey: ['maintenance', propertyId] })
      setOpen(false)
      reset()
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create request')
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Requests"
        description="Track and manage all property maintenance"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        }
      />

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {humanizeStatus(s)}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        total={meta?.total ?? rows.length}
        page={page}
        perPage={25}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/dashboard/maintenance/${r.id}`)}
        searchable
        searchPlaceholder="Search requests…"
        emptyMessage="No maintenance requests found."
      />

      {/* Create Request Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-600" />
              New Maintenance Request
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4 py-2" onSubmit={handleSubmit(v => mutation.mutate(v))}>
            <Input
              label="Title"
              {...register('title')}
              error={errors.title?.message}
              placeholder="Brief description of the issue"
            />

            <div className="space-y-1">
              <Label>Description</Label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Detailed description of the maintenance issue…"
              />
              {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Priority</Label>
                <Select onValueChange={(v) => setValue('priority', v as CreateMaintenanceFormValues['priority'])} defaultValue="medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
                      <SelectItem key={p} value={p}>{humanizeStatus(p)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Category</Label>
                <Select onValueChange={(v) => setValue('category', v as CreateMaintenanceFormValues['category'])} defaultValue="other">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['plumbing', 'electrical', 'structural', 'appliance', 'hvac', 'pest_control', 'cleaning', 'other'] as const).map(c => (
                      <SelectItem key={c} value={c}>{humanizeStatus(c)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Unit</Label>
              <Select onValueChange={(v) => setValue('unit_id', v)}>
                <SelectTrigger error={errors.unit_id?.message}>
                  <SelectValue placeholder="Select unit…" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem key={u.id} value={u.id}>Unit {u.unit_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit_id && <p className="text-xs text-red-600">{errors.unit_id.message}</p>}
            </div>

            <Input
              label="Estimated Cost (GHS, optional)"
              type="number"
              min={0}
              {...register('estimated_cost')}
              placeholder="0"
            />
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); reset() }}>Cancel</Button>
            <Button onClick={handleSubmit(v => mutation.mutate(v))} loading={mutation.isPending}>
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
