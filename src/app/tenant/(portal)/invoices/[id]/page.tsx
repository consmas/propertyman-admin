'use client'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { PageHeader } from '@/components/shared/page-header'
import { formatCurrency, formatDate, humanizeStatus } from '@/lib/utils'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_amount: number
  line_total: number
}

const STATUS_VARIANT: Record<string, 'success' | 'gray' | 'danger' | 'warning'> = {
  paid: 'success',
  draft: 'gray',
  void: 'gray',
  issued: 'warning',
  partial: 'warning',
  overdue: 'danger',
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-start justify-between gap-4 py-3 last:border-0"
      style={{ borderBottom: '1px solid var(--border-default)' }}
    >
      <span
        className="text-[12px] font-bold uppercase tracking-[0.07em] shrink-0 mt-0.5 min-w-[120px]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </span>
      <span className="text-[13px] font-medium text-right" style={{ color: 'var(--text-primary)' }}>
        {children}
      </span>
    </div>
  )
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
    <div className="fade-up space-y-6 max-w-4xl">
      {/* Header */}
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Invoice info */}
        <Card className="p-6">
          <h3
            className="font-display text-[15px] font-semibold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Invoice Info
          </h3>
          <DetailRow label="Number">
            <span className="font-mono text-[12px]">{invoice.invoice_number}</span>
          </DetailRow>
          <DetailRow label="Type">{humanizeStatus(invoice.invoice_type)}</DetailRow>
          <DetailRow label="Status">
            <Badge variant={STATUS_VARIANT[invoice.status] ?? 'gray'}>{invoice.status}</Badge>
          </DetailRow>
          <DetailRow label="Issued">{formatDate(invoice.issue_date)}</DetailRow>
          <DetailRow label="Due Date">{formatDate(invoice.due_date)}</DetailRow>
        </Card>

        {/* Amounts */}
        <Card className="p-6">
          <h3
            className="font-display text-[15px] font-semibold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Amounts
          </h3>
          <DetailRow label="Total">{formatCurrency(invoice.total)}</DetailRow>
          <DetailRow label="Paid">
            <span style={{ color: 'var(--success-500)' }} className="font-bold">
              {formatCurrency(paidAmount)}
            </span>
          </DetailRow>
          <div
            className="flex items-center justify-between py-3"
            style={{ borderTop: '2px solid var(--border-default)' }}
          >
            <span
              className="text-[13px] font-bold uppercase tracking-[0.05em]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Balance Due
            </span>
            <span
              className="font-display text-[20px] font-bold"
              style={{
                color: (invoice.balance ?? 0) > 0 ? 'var(--error-500)' : 'var(--success-500)',
              }}
            >
              {formatCurrency(invoice.balance)}
            </span>
          </div>

          {(invoice.balance ?? 0) > 0 && (
            <div className="mt-4">
              <Link href={`/tenant/invoices/${invoice.id}/pay`} className="block">
                <Button className="w-full">Pay Now</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Line items */}
      {items.length > 0 && (
        <Card className="p-6">
          <h3
            className="font-display text-[15px] font-semibold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Line Items
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                  {['Description', 'Qty', 'Unit Price', 'Total'].map((h) => (
                    <th
                      key={h}
                      className={`pb-3 text-[11px] font-bold uppercase tracking-[0.07em] ${h !== 'Description' ? 'text-right' : 'text-left'}`}
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid var(--border-default)' }}
                  >
                    <td className="py-3 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                      {item.description}
                    </td>
                    <td className="py-3 text-[13px] text-right" style={{ color: 'var(--text-secondary)' }}>
                      {item.quantity}
                    </td>
                    <td className="py-3 text-[13px] text-right" style={{ color: 'var(--text-secondary)' }}>
                      {formatCurrency(item.unit_amount)}
                    </td>
                    <td
                      className="py-3 text-[13px] font-semibold text-right"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {formatCurrency(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
