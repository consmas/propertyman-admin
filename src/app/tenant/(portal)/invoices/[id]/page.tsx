'use client'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, humanizeStatus } from '@/lib/utils'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_amount: number
  line_total: number
}

export default function TenantInvoiceDetailPage() {
  const params = useParams<{ id: string }>()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tenant-invoice-detail', params.id],
    queryFn: () => invoicesEndpoints.get(params.id),
    enabled: Boolean(params.id),
  })

  if (isLoading) return <PageLoader />
  if (isError || !data?.data) {
    return <ErrorState message="Failed to load invoice" onRetry={() => refetch()} />
  }

  const invoice = data.data
  const items = (invoice as unknown as { items?: InvoiceItem[] }).items ?? []
  const paidAmount = (invoice.total ?? 0) - (invoice.balance ?? 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tenant/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={`Invoice ${invoice.invoice_number}`}
          description={`${humanizeStatus(invoice.invoice_type)} · ${humanizeStatus(invoice.status)}`}
        />
      </div>

      {/* Invoice summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Invoice Info</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Number</p>
              <p className="mt-1 text-gray-900 font-mono">{invoice.invoice_number}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Type</p>
              <p className="mt-1 text-gray-900">{humanizeStatus(invoice.invoice_type)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Status</p>
              <p className="mt-1 text-gray-900">{humanizeStatus(invoice.status)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Issued</p>
              <p className="mt-1 text-gray-900">{formatDate(invoice.issue_date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Due Date</p>
              <p className="mt-1 text-gray-900">{formatDate(invoice.due_date)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Amounts</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.total)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Paid</p>
              <p className="text-sm font-semibold text-emerald-700">{formatCurrency(paidAmount)}</p>
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Outstanding Balance</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(invoice.balance)}</p>
            </div>
          </div>

          {(invoice.balance ?? 0) > 0 && (
            <div className="pt-2">
              <Link href={`/tenant/invoices/${invoice.id}/pay`} className="block">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Pay Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Line items */}
      {items.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Line Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                  <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
                  <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Unit Price</th>
                  <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="py-3 text-sm text-gray-900">{item.description}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{formatCurrency(item.unit_amount)}</td>
                    <td className="py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
