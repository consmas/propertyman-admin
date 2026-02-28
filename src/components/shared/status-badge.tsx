import { Badge, type BadgeProps } from '@/components/ui/badge'
import { humanizeStatus } from '@/lib/utils'

type StatusMap = Record<string, BadgeProps['variant']>

const invoiceStatusMap: StatusMap = {
  draft: 'gray',
  issued: 'blue',
  partial: 'warning',
  paid: 'success',
  overdue: 'danger',
  void: 'gray',
}

const leaseStatusMap: StatusMap = {
  active: 'success',
  expired: 'gray',
  terminated: 'danger',
  pending: 'warning',
}

const unitStatusMap: StatusMap = {
  available: 'blue',
  occupied: 'success',
  unavailable: 'gray',
  vacant: 'blue',
  maintenance: 'warning',
  reserved: 'purple',
}

const maintenanceStatusMap: StatusMap = {
  open: 'blue',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'gray',
  cancelled: 'gray',
}

const maintenancePriorityMap: StatusMap = {
  low: 'gray',
  medium: 'warning',
  high: 'warning',
  urgent: 'danger',
  critical: 'danger',
}

const tenantStatusMap: StatusMap = {
  active: 'success',
  inactive: 'gray',
  archived: 'gray',
}

const propertyStatusMap: StatusMap = {
  active: 'success',
  inactive: 'gray',
  maintenance: 'warning',
}

interface StatusBadgeProps {
  status: string | null | undefined
  type: 'invoice' | 'lease' | 'unit' | 'maintenance' | 'maintenance_priority' | 'tenant' | 'property'
  className?: string
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  if (!status) return <Badge variant="gray" className={className}>—</Badge>
  const maps: Record<string, StatusMap> = {
    invoice: invoiceStatusMap,
    lease: leaseStatusMap,
    unit: unitStatusMap,
    maintenance: maintenanceStatusMap,
    maintenance_priority: maintenancePriorityMap,
    tenant: tenantStatusMap,
    property: propertyStatusMap,
  }
  const variant = maps[type]?.[status] ?? 'gray'
  return (
    <Badge variant={variant} className={className}>
      {humanizeStatus(status)}
    </Badge>
  )
}
