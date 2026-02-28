'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Home,
  FileText,
  CreditCard,
  Wrench,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { propertiesApi } from '@/lib/api/properties'
import { KpiCard } from '@/components/shared/kpi-card'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatRelativeDate, formatPercent } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import type { DashboardData, RecentActivity } from '@/types'

const activityIconMap: Record<RecentActivity['type'], React.ElementType> = {
  payment: CreditCard,
  invoice: FileText,
  maintenance: Wrench,
  lease: FileText,
}

const activityColorMap: Record<RecentActivity['type'], string> = {
  payment: 'text-emerald-600 bg-emerald-50',
  invoice: 'text-blue-600 bg-blue-50',
  maintenance: 'text-amber-600 bg-amber-50',
  lease: 'text-purple-600 bg-purple-50',
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const Icon = activityIconMap[activity.type]
  const colors = activityColorMap[activity.type]

  return (
    <div className="flex items-start gap-3">
      <div className={`rounded-lg p-2 shrink-0 ${colors}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
        <p className="text-xs text-gray-500 truncate">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatRelativeDate(activity.timestamp)}</p>
      </div>
      {activity.amount && (
        <span className="text-sm font-semibold text-gray-900 shrink-0">
          {formatCurrency(activity.amount)}
        </span>
      )}
    </div>
  )
}

// Fallback demo data when API is not connected
const DEMO_DATA: DashboardData = {
  kpis: {
    total_units: 48,
    occupied_units: 41,
    vacant_units: 7,
    occupancy_rate: 85.4,
    open_invoices: 12,
    total_outstanding: '245000',
    collected_this_month: '890000',
    pending_maintenance: 5,
    overdue_invoices: 3,
    active_leases: 41,
  },
  recent_activity: [
    { id: '1', type: 'payment', title: 'Payment received', description: 'James Mwangi - Unit 12B', timestamp: new Date(Date.now() - 3600000).toISOString(), amount: '45000', property_id: '' },
    { id: '2', type: 'invoice', title: 'Invoice issued', description: 'Rent for March 2025 - Unit 7A', timestamp: new Date(Date.now() - 7200000).toISOString(), amount: '35000', property_id: '' },
    { id: '3', type: 'maintenance', title: 'Maintenance request', description: 'Plumbing issue - Unit 3C', timestamp: new Date(Date.now() - 86400000).toISOString(), property_id: '' },
    { id: '4', type: 'lease', title: 'Lease signed', description: 'Sarah Kamau - Unit 15D (12 months)', timestamp: new Date(Date.now() - 172800000).toISOString(), property_id: '' },
    { id: '5', type: 'payment', title: 'Payment received', description: 'Grace Otieno - Unit 9B', timestamp: new Date(Date.now() - 259200000).toISOString(), amount: '28000', property_id: '' },
  ],
  monthly_collections: [
    { month: 'Aug', amount: 720000 },
    { month: 'Sep', amount: 810000 },
    { month: 'Oct', amount: 760000 },
    { month: 'Nov', amount: 850000 },
    { month: 'Dec', amount: 920000 },
    { month: 'Jan', amount: 890000 },
  ],
  occupancy_trend: [
    { month: 'Aug', rate: 79 },
    { month: 'Sep', rate: 81 },
    { month: 'Oct', rate: 83 },
    { month: 'Nov', rate: 85 },
    { month: 'Dec', rate: 85 },
    { month: 'Jan', rate: 85 },
  ],
}

export default function DashboardPage() {
  const propertyId = useCurrentPropertyId()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', propertyId],
    queryFn: () => propertyId ? propertiesApi.getDashboard(propertyId) : DEMO_DATA,
    enabled: !!propertyId,
    placeholderData: DEMO_DATA,
  })

  const kpis = data?.kpis ?? DEMO_DATA.kpis
  const activity = data?.recent_activity ?? DEMO_DATA.recent_activity
  const collections = data?.monthly_collections ?? DEMO_DATA.monthly_collections
  const occupancy = data?.occupancy_trend ?? DEMO_DATA.occupancy_trend

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your property portfolio"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Occupied Units"
          value={`${kpis.occupied_units} / ${kpis.total_units}`}
          subtitle={`${formatPercent(kpis.occupancy_rate)} occupancy`}
          icon={Home}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          isLoading={isLoading}
        />
        <KpiCard
          title="Open Invoices"
          value={kpis.open_invoices}
          subtitle={`${kpis.overdue_invoices} overdue`}
          icon={FileText}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          isLoading={isLoading}
        />
        <KpiCard
          title="Collected This Month"
          value={formatCurrency(kpis.collected_this_month)}
          subtitle="Total payments received"
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          isLoading={isLoading}
        />
        <KpiCard
          title="Pending Maintenance"
          value={kpis.pending_maintenance}
          subtitle="Open requests"
          icon={Wrench}
          iconColor="text-red-600"
          iconBg="bg-red-50"
          isLoading={isLoading}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <CheckCircle className="h-8 w-8 text-emerald-500 shrink-0" />
          <div>
            <p className="text-xl font-bold text-gray-900">{kpis.active_leases}</p>
            <p className="text-sm text-gray-500">Active leases</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <AlertCircle className="h-8 w-8 text-red-500 shrink-0" />
          <div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(kpis.total_outstanding)}</p>
            <p className="text-sm text-gray-500">Total outstanding balance</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <Clock className="h-8 w-8 text-amber-500 shrink-0" />
          <div>
            <p className="text-xl font-bold text-gray-900">{kpis.vacant_units}</p>
            <p className="text-sm text-gray-500">Vacant units</p>
          </div>
        </div>
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Collections chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Monthly Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={collections} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="collectionsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Collected']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#collectionsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.map(item => (
              <ActivityItem key={item.id} activity={item} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Occupancy trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Occupancy Rate Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={occupancy} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={[60, 100]}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Occupancy']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
