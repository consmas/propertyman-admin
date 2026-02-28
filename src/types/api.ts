// ─── Shared response wrappers ─────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  meta?: ApiMeta
}

export interface ApiMeta {
  total?: number
  page?: number
  per_page?: number
  total_pages?: number
}

export interface ApiErrorItem {
  status: string | number
  title: string
  detail?: string
  source?: { pointer?: string; parameter?: string }
}

export interface ApiErrorResponse {
  errors: ApiErrorItem[]
}

export interface PaginationParams {
  page?: number
  per_page?: number
}

export type UUID = string

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'owner'
  | 'admin'
  | 'property_manager'
  | 'caretaker'
  | 'accountant'
  | 'tenant'

export interface ApiAuthUser {
  id: UUID
  email: string
  full_name: string
  role: UserRole
}

/** POST /api/v1/auth/login body */
export interface LoginRequest {
  auth: {
    email: string
    password: string
  }
}

/** POST /api/v1/auth/login → data payload */
export interface LoginResponseData {
  access_token: string
  refresh_token: string
  access_expires_at: string
  refresh_expires_at: string
  user: ApiAuthUser
}

/** POST /api/v1/auth/refresh body */
export interface RefreshRequest {
  auth: {
    refresh_token: string
  }
}

/** DELETE /api/v1/auth/logout body */
export interface LogoutRequest {
  auth: {
    refresh_token: string
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: UUID
  email: string
  full_name: string
  role: UserRole
  phone?: string
  status?: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface ListUsersParams extends PaginationParams {
  role?: UserRole
  status?: 'active' | 'inactive'
  property_id?: UUID
}

export interface CreateUserRequest {
  user: {
    email: string
    full_name: string
    role: UserRole
    password?: string
    phone?: string
    status?: 'active' | 'inactive'
  }
}

export interface UpdateUserRequest {
  user: Partial<CreateUserRequest['user']>
}

// ─── Property Memberships ─────────────────────────────────────────────────────

export interface ApiPropertyMembership {
  id: UUID
  user_id: UUID
  property_id: UUID
  role: Exclude<UserRole, 'owner' | 'admin'> | 'admin'
  status?: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface ListPropertyMembershipsParams extends PaginationParams {
  property_id?: UUID
  user_id?: UUID
  role?: ApiPropertyMembership['role']
}

export interface CreatePropertyMembershipRequest {
  property_membership: {
    user_id: UUID
    property_id: UUID
    role: ApiPropertyMembership['role']
    status?: 'active' | 'inactive'
  }
}

export interface UpdatePropertyMembershipRequest {
  property_membership: Partial<CreatePropertyMembershipRequest['property_membership']>
}

// ─── Properties ───────────────────────────────────────────────────────────────

export interface ApiProperty {
  id: UUID
  name: string
  code?: string
  address?: string
  address_line_1?: string
  city: string
  state: string
  zip_code?: string
  postal_code?: string
  country: string
  total_units: number
  occupied_units: number
  status?: 'active' | 'inactive' | 'maintenance'
  active?: boolean
  created_at: string
  updated_at: string
}

export interface ListPropertiesParams extends PaginationParams {
  status?: ApiProperty['status']
}

export interface CreatePropertyRequest {
  property: {
    name: string
    code: string
    address_line_1: string
    city: string
    state: string
    country: string
    postal_code: string
    active: boolean
  }
}

export interface UpdatePropertyRequest {
  property: Partial<CreatePropertyRequest['property']> & {
    status?: 'active' | 'inactive' | 'maintenance'
  }
}

// ─── Units ────────────────────────────────────────────────────────────────────

export type UnitStatus =
  | 'available'
  | 'occupied'
  | 'maintenance'
  | 'unavailable'
  | 'vacant'
  | 'reserved'

export interface ApiUnit {
  id: UUID
  property_id: UUID
  unit_number: string
  name?: string
  unit_type?: string
  floor?: number | null
  bedrooms?: number
  bathrooms?: number
  area_sqft?: number | null
  monthly_rent_cents?: number
  rent_cents?: number
  status: UnitStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface ListUnitsParams extends PaginationParams {
  property_id?: UUID
  status?: ApiUnit['status']
}

export interface CreateUnitRequest {
  unit: {
    property_id: UUID
    unit_number: string
    name?: string
    unit_type?: string
    status?: ApiUnit['status']
    monthly_rent_cents?: number
    floor?: number | null
    bedrooms?: number
    bathrooms?: number
    area_sqft?: number | null
    rent_cents?: number
    notes?: string
  }
}

export interface UpdateUnitRequest {
  unit: Partial<CreateUnitRequest['unit']>
}

// ─── Tenants ──────────────────────────────────────────────────────────────────

export interface ApiTenant {
  id: UUID
  property_id?: UUID
  unit_id?: UUID
  first_name?: string
  last_name?: string
  full_name?: string
  email: string
  phone: string
  national_id?: string
  status: 'active' | 'inactive' | 'archived'
  outstanding_cents: number
  created_at: string
  updated_at: string
}

export interface ListTenantsParams extends PaginationParams {
  property_id?: UUID
  unit_id?: UUID
  status?: ApiTenant['status']
}

export interface CreateTenantRequest {
  tenant: {
    property_id: UUID
    unit_id?: UUID
    full_name: string
    email: string
    phone: string
    national_id?: string
    status?: ApiTenant['status']
  }
}

export interface UpdateTenantRequest {
  tenant: Partial<CreateTenantRequest['tenant']>
}

// ─── Leases ───────────────────────────────────────────────────────────────────

export type LeasePlanMonths = 3 | 6 | 12

/** POST /api/v1/leases body */
export interface CreateLeaseRequest {
  lease: {
    property_id: UUID
    unit_id: UUID
    tenant_id: UUID
    start_date: string
    end_date: string
    plan_months: LeasePlanMonths
    status: 'active' | 'pending'
    rent_cents: number
    security_deposit_cents: number
  }
}

export interface UpdateLeaseRequest {
  lease: Omit<Partial<CreateLeaseRequest['lease']>, 'status'> & {
    status?: 'active' | 'pending' | 'expired' | 'terminated'
  }
}

export interface ListLeasesParams extends PaginationParams {
  property_id?: UUID
  status?: 'active' | 'pending' | 'expired' | 'terminated'
  tenant_id?: UUID
  unit_id?: UUID
}

export interface ApiLease {
  id: UUID
  property_id: UUID
  unit_id: UUID
  tenant_id: UUID
  start_date: string
  end_date: string
  plan_months: LeasePlanMonths
  status: 'active' | 'pending' | 'expired' | 'terminated'
  rent_cents: number
  security_deposit_cents: number
  paid_through_date?: string
  created_at: string
  updated_at: string
}

// ─── Rent Installments ────────────────────────────────────────────────────────

export interface ApiRentInstallment {
  id: UUID
  lease_id: UUID
  invoice_id?: UUID
  due_date: string
  amount_cents: number
  balance_cents: number
  status: 'pending' | 'paid' | 'overdue' | 'partial'
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface ListRentInstallmentsParams extends PaginationParams {
  lease_id?: UUID
  status?: ApiRentInstallment['status']
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'issued' | 'partial' | 'paid' | 'overdue' | 'void'
export type InvoiceType = 'rent' | 'water' | 'electricity' | 'service_charge' | 'penalty' | 'other'

export interface ApiInvoice {
  id: UUID
  property_id: UUID
  tenant_id?: UUID
  unit_id?: UUID
  lease_id?: UUID
  invoice_number: string
  invoice_type: InvoiceType
  status: InvoiceStatus
  amount_cents: number
  amount_paid_cents: number
  balance_cents: number
  issued_on: string
  due_on: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ListInvoicesParams extends PaginationParams {
  property_id?: UUID
  status?: InvoiceStatus
  invoice_type?: InvoiceType
  tenant_id?: UUID
  lease_id?: UUID
}

export interface CreateInvoiceRequest {
  invoice: {
    property_id: UUID
    tenant_id?: UUID
    unit_id?: UUID
    lease_id?: UUID
    invoice_type: InvoiceType
    issued_on: string
    due_on: string
    notes?: string
  }
}

export interface UpdateInvoiceRequest {
  invoice: Partial<CreateInvoiceRequest['invoice']> & {
    status?: InvoiceStatus
  }
}

// ─── Invoice Items ────────────────────────────────────────────────────────────

export interface ApiInvoiceItem {
  id: UUID
  invoice_id: UUID
  description: string
  quantity: number
  unit_price_cents: number
  amount_cents: number
  created_at: string
  updated_at: string
}

export interface CreateInvoiceItemRequest {
  invoice_item: {
    description: string
    quantity: number
    unit_price_cents: number
  }
}

export interface UpdateInvoiceItemRequest {
  invoice_item: Partial<CreateInvoiceItemRequest['invoice_item']>
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque' | 'card'

export interface PaymentAllocationItem {
  invoice_id: UUID
  invoice_number?: string
  amount_cents: number
}

/** POST /api/v1/payments body */
export interface CreatePaymentRequest {
  payment: {
    property_id: UUID
    tenant_id: UUID
    reference: string
    payment_method: PaymentMethod
    amount_cents: number
    paid_at: string
    notes?: string
  }
}

export interface ApiPayment {
  id: UUID
  property_id: UUID
  tenant_id: UUID
  reference: string
  payment_method: PaymentMethod
  amount_cents: number
  paid_at: string
  notes?: string
  unallocated_cents: number
  allocations: PaymentAllocationItem[]
  created_at: string
  updated_at: string
}

export interface ListPaymentsParams extends PaginationParams {
  property_id?: UUID
  tenant_id?: UUID
}

// ─── Payment Allocations ──────────────────────────────────────────────────────

export interface ApiPaymentAllocation {
  id: UUID
  payment_id: UUID
  invoice_id: UUID
  amount_cents: number
  allocated_at: string
  created_at: string
  updated_at: string
}

export interface ListPaymentAllocationsParams extends PaginationParams {
  payment_id?: UUID
  invoice_id?: UUID
}

// ─── Meter Readings ───────────────────────────────────────────────────────────

export type MeterType = 'water' | 'electricity' | 'gas' | 'other'

export interface ApiMeterReading {
  id: UUID
  property_id: UUID
  unit_id?: UUID
  meter_type: MeterType
  reading_value: number
  reading_on: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ListMeterReadingsParams extends PaginationParams {
  property_id?: UUID
  unit_id?: UUID
  meter_type?: MeterType
}

export interface CreateMeterReadingRequest {
  meter_reading: {
    property_id: UUID
    unit_id?: UUID
    meter_type: MeterType
    reading_value: number
    reading_on: string
    notes?: string
  }
}

export interface UpdateMeterReadingRequest {
  meter_reading: Partial<CreateMeterReadingRequest['meter_reading']>
}

// ─── Pump Topups ──────────────────────────────────────────────────────────────

export interface ApiPumpTopup {
  id: UUID
  property_id: UUID
  topup_on: string
  volume_liters: number
  amount_cents: number
  vendor_name?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ListPumpTopupsParams extends PaginationParams {
  property_id?: UUID
}

export interface CreatePumpTopupRequest {
  pump_topup: {
    property_id: UUID
    topup_on: string
    volume_liters: number
    amount_cents: number
    vendor_name?: string
    notes?: string
  }
}

export interface UpdatePumpTopupRequest {
  pump_topup: Partial<CreatePumpTopupRequest['pump_topup']>
}

// ─── Maintenance Requests ─────────────────────────────────────────────────────

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent'
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled'

/** POST /api/v1/maintenance_requests body */
export interface CreateMaintenanceRequest {
  maintenance_request: {
    property_id: UUID
    unit_id: UUID
    tenant_id?: UUID
    title: string
    description: string
    priority: MaintenancePriority
    status: MaintenanceStatus
    requested_at: string
    notes?: string
  }
}

export interface UpdateMaintenanceRequest {
  maintenance_request: Partial<CreateMaintenanceRequest['maintenance_request']>
}

export interface ListMaintenanceRequestsParams extends PaginationParams {
  property_id?: UUID
  status?: MaintenanceStatus
  priority?: MaintenancePriority
}

export interface ApiMaintenanceRequest {
  id: UUID
  property_id: UUID
  unit_id: UUID
  tenant_id?: UUID
  title: string
  description: string
  priority: MaintenancePriority
  status: MaintenanceStatus
  requested_at: string
  resolved_at?: string
  notes?: string
  assigned_to?: string
  estimated_cost_cents?: number
  actual_cost_cents?: number
  created_at: string
  updated_at: string
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export interface ApiAuditLog {
  id: UUID
  property_id?: UUID
  action: string
  actor_id?: UUID
  actor_name?: string
  entity_type?: string
  entity_id?: UUID
  metadata?: Record<string, unknown>
  created_at: string
}

export interface ListAuditLogsParams extends PaginationParams {
  property_id?: UUID
  action?: string
}

// ─── Billing Run ──────────────────────────────────────────────────────────────

export interface RunWaterBillingRequest {
  property_id: UUID
  billing_month?: string
}

export interface WaterBillingRunResult {
  property_id: UUID
  billing_month: string
  invoices_created: number
  invoice_ids?: UUID[]
}
