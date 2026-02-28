import type { UserRole } from '@/types/api'

export const APP_ROUTE_ROLES: Record<string, UserRole[]> = {
  '/app/users': ['owner', 'admin'],
  '/app/memberships': ['owner', 'admin'],
  '/app/properties': ['owner', 'admin', 'property_manager'],
  '/app/units': ['owner', 'admin', 'property_manager', 'caretaker'],
  '/app/tenants': ['owner', 'admin', 'property_manager'],
  '/app/leases': ['owner', 'admin', 'property_manager'],
  '/app/rent-installments': ['owner', 'admin', 'property_manager', 'accountant'],
  '/app/invoices': ['owner', 'admin', 'property_manager', 'accountant'],
  '/app/payments': ['owner', 'admin', 'property_manager', 'accountant'],
  '/app/payment-allocations': ['owner', 'admin', 'accountant'],
  '/app/meter-readings': ['owner', 'admin', 'property_manager', 'caretaker'],
  '/app/pump-topups': ['owner', 'admin', 'property_manager', 'caretaker'],
  '/app/maintenance': ['owner', 'admin', 'property_manager', 'caretaker'],
  '/app/audit-logs': ['owner', 'admin', 'accountant'],
  '/app/billing': ['owner', 'admin', 'accountant'],
  '/app/dashboard': ['owner', 'admin', 'property_manager', 'accountant', 'caretaker', 'tenant'],
}

export function canAccessPath(pathname: string, role?: UserRole | null): boolean {
  if (!role) return false

  for (const [prefix, allowedRoles] of Object.entries(APP_ROUTE_ROLES)) {
    if (pathname.startsWith(prefix)) {
      return allowedRoles.includes(role)
    }
  }

  // Default allow for unspecified /app paths to avoid accidental lockout.
  return true
}
