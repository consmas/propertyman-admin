// ─── JSON:API base types ────────────────────────────────────────────────────

export interface JsonApiResource<T = Record<string, unknown>> {
  id: string
  type: string
  attributes: T
  relationships?: Record<string, JsonApiRelationship>
}

export interface JsonApiRelationship {
  data: JsonApiResourceIdentifier | JsonApiResourceIdentifier[] | null
  links?: { related?: string; self?: string }
}

export interface JsonApiResourceIdentifier {
  id: string
  type: string
}

export interface JsonApiResponse<T> {
  data: T
  included?: JsonApiResource[]
  meta?: JsonApiMeta
  links?: JsonApiLinks
}

export interface JsonApiMeta {
  total?: number
  page?: number
  per_page?: number
  total_pages?: number
  [key: string]: unknown
}

export interface JsonApiLinks {
  self?: string
  first?: string
  last?: string
  prev?: string | null
  next?: string | null
}

export interface JsonApiError {
  status: string
  title: string
  detail?: string
  source?: { pointer?: string; parameter?: string }
}

export interface JsonApiErrorResponse {
  errors: JsonApiError[]
}

// ─── Auth types ─────────────────────────────────────────────────────────────

export type UserRole =
  | 'owner'
  | 'admin'
  | 'property_manager'
  | 'caretaker'
  | 'accountant'
  | 'tenant'

export interface AuthUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  avatar_url?: string
  properties?: string[] // property IDs the user has access to
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: AuthUser | null
  access_token: string | null
  refresh_token: string | null
  is_authenticated: boolean
  is_loading: boolean
}

// ─── Property types ──────────────────────────────────────────────────────────

export interface PropertyAttributes {
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  country: string
  total_units: number
  occupied_units: number
  status: 'active' | 'inactive' | 'maintenance'
  created_at: string
  updated_at: string
}

export type Property = JsonApiResource<PropertyAttributes>
export type PropertyResponse = JsonApiResponse<Property>
export type PropertiesResponse = JsonApiResponse<Property[]>

// ─── Unit types ──────────────────────────────────────────────────────────────

export interface UnitAttributes {
  unit_number: string
  floor: number | null
  bedrooms: number
  bathrooms: number
  area_sqft: number | null
  monthly_rent: string
  status: 'vacant' | 'occupied' | 'maintenance' | 'reserved'
  amenities: string[]
  property_id: string
  created_at: string
  updated_at: string
}

export type Unit = JsonApiResource<UnitAttributes>
export type UnitResponse = JsonApiResponse<Unit>
export type UnitsResponse = JsonApiResponse<Unit[]>

// ─── Tenant types ────────────────────────────────────────────────────────────

export interface TenantAttributes {
  first_name: string
  last_name: string
  email: string
  phone: string
  national_id?: string
  date_of_birth?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  status: 'active' | 'inactive' | 'blacklisted'
  outstanding_balance: string
  created_at: string
  updated_at: string
}

export type Tenant = JsonApiResource<TenantAttributes>
export type TenantResponse = JsonApiResponse<Tenant>
export type TenantsResponse = JsonApiResponse<Tenant[]>

// ─── Lease types ─────────────────────────────────────────────────────────────

export type LeaseDuration = 3 | 6 | 12

export interface LeaseAttributes {
  start_date: string
  end_date: string
  monthly_rent: string
  security_deposit: string
  status: 'active' | 'expired' | 'terminated' | 'pending'
  duration_months: LeaseDuration
  paid_through_date: string | null
  tenant_id: string
  unit_id: string
  property_id: string
  created_at: string
  updated_at: string
}

export type Lease = JsonApiResource<LeaseAttributes>
export type LeaseResponse = JsonApiResponse<Lease>
export type LeasesResponse = JsonApiResponse<Lease[]>

export interface CreateLeasePayload {
  tenant_id: string
  unit_id: string
  start_date: string
  duration_months: LeaseDuration
  monthly_rent: number
  security_deposit: number
}

export interface RentInstallment {
  id: string
  due_date: string
  amount: string
  status: 'pending' | 'paid' | 'overdue'
  invoice_id?: string
}

// ─── Invoice types ───────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'issued' | 'partial' | 'paid' | 'overdue' | 'void'
export type InvoiceType = 'rent' | 'water' | 'electricity' | 'service_charge' | 'penalty' | 'other'

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unit_price: string
  total: string
}

export interface InvoiceAttributes {
  invoice_number: string
  type: InvoiceType
  status: InvoiceStatus
  amount: string
  balance_due: string
  amount_paid: string
  due_date: string
  issued_date: string
  notes?: string
  line_items: InvoiceLineItem[]
  tenant_id: string
  unit_id: string
  property_id: string
  lease_id?: string
  created_at: string
  updated_at: string
}

export type Invoice = JsonApiResource<InvoiceAttributes>
export type InvoiceResponse = JsonApiResponse<Invoice>
export type InvoicesResponse = JsonApiResponse<Invoice[]>

export interface InvoiceFilters {
  status?: InvoiceStatus
  type?: InvoiceType
  date_from?: string
  date_to?: string
  tenant_id?: string
  unit_id?: string
  property_id?: string
  page?: number
  per_page?: number
}

// ─── Payment types ───────────────────────────────────────────────────────────

export interface AllocationDetail {
  invoice_id: string
  invoice_number: string
  amount_allocated: string
}

export interface PaymentAttributes {
  payment_number: string
  amount: string
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque' | 'card'
  reference_number?: string
  notes?: string
  unallocated_balance: string
  allocations: AllocationDetail[]
  tenant_id: string
  property_id: string
  recorded_by: string
  created_at: string
  updated_at: string
}

export type Payment = JsonApiResource<PaymentAttributes>
export type PaymentResponse = JsonApiResponse<Payment>
export type PaymentsResponse = JsonApiResponse<Payment[]>

export interface RecordPaymentPayload {
  tenant_id: string
  property_id: string
  amount: number
  payment_date: string
  payment_method: PaymentAttributes['payment_method']
  reference_number?: string
  notes?: string
}

// ─── Maintenance types ───────────────────────────────────────────────────────

export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled'
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent'
export type MaintenanceCategory =
  | 'plumbing'
  | 'electrical'
  | 'structural'
  | 'appliance'
  | 'hvac'
  | 'pest_control'
  | 'cleaning'
  | 'other'

export interface MaintenanceAttributes {
  title: string
  description: string
  status: MaintenanceStatus
  priority: MaintenancePriority
  category: MaintenanceCategory
  reported_date: string
  resolved_date?: string
  estimated_cost?: string
  actual_cost?: string
  assigned_to?: string
  notes?: string
  tenant_id?: string
  unit_id: string
  property_id: string
  created_at: string
  updated_at: string
}

export type MaintenanceRequest = JsonApiResource<MaintenanceAttributes>
export type MaintenanceResponse = JsonApiResponse<MaintenanceRequest>
export type MaintenanceListResponse = JsonApiResponse<MaintenanceRequest[]>

export interface CreateMaintenancePayload {
  title: string
  description: string
  priority: MaintenancePriority
  category: MaintenanceCategory
  unit_id: string
  property_id: string
  tenant_id?: string
  estimated_cost?: number
}

// ─── Dashboard / KPI types ───────────────────────────────────────────────────

export interface DashboardKpis {
  total_units: number
  occupied_units: number
  vacant_units: number
  occupancy_rate: number
  open_invoices: number
  total_outstanding: string
  collected_this_month: string
  pending_maintenance: number
  overdue_invoices: number
  active_leases: number
}

export interface RecentActivity {
  id: string
  type: 'payment' | 'invoice' | 'maintenance' | 'lease'
  title: string
  description: string
  timestamp: string
  status?: string
  amount?: string
  property_id: string
}

export interface DashboardData {
  kpis: DashboardKpis
  recent_activity: RecentActivity[]
  monthly_collections: { month: string; amount: number }[]
  occupancy_trend: { month: string; rate: number }[]
}

// ─── Query / Filter types ─────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  per_page?: number
}

export interface SortParams {
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface SearchParams {
  search?: string
}

export type ListParams = PaginationParams & SortParams & SearchParams & {
  property_id?: string
  [key: string]: unknown
}

// ─── API Error ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number
  errors: JsonApiError[]

  constructor(message: string, status: number, errors: JsonApiError[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}
