'use client'

import { use } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Printer, XCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { invoicesApi } from '@/lib/api/invoices'
import { parseSingle } from '@/lib/jsonapi'
import { useHasRole } from '@/hooks/use-auth'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate, humanizeStatus } from '@/lib/utils'
import type { InvoiceAttributes } from '@/types'

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const propertyId = useCurrentPropertyId()
  const queryClient = useQueryClient()
  const canVoid = useHasRole('owner', 'admin', 'accountant')

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', propertyId, id],
    queryFn: () => invoicesApi.get(propertyId!, id),
    enabled: !!propertyId,
  })

  const voidMutation = useMutation({
    mutationFn: () => invoicesApi.void(propertyId!, id),
    onSuccess: () => {
      toast.success('Invoice voided')
      queryClient.invalidateQueries({ queryKey: ['invoice', propertyId, id] })
    },
    onError: () => toast.error('Failed to void invoice'),
  })

  const invoice = data ? parseSingle<InvoiceAttributes>(data as never) : null

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!invoice) return null

  const isPaid = invoice.status === 'paid'
  const isVoid = invoice.status === 'void'

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/invoices">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title={invoice.invoice_number}
          description={`${humanizeStatus(invoice.type)} Invoice`}
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={invoice.status} type="invoice" />
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
              {canVoid && !isVoid && !isPaid && (
                <Button
                  variant="destructive"
                  size="sm"
                  loading={voidMutation.isPending}
                  onClick={() => {
                    if (confirm('Void this invoice?')) voidMutation.mutate()
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  Void
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Invoice card */}
      <Card>
        <CardContent className="p-6">
          {/* Header info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Issued Date</p>
              <p className="text-sm font-medium mt-1">{formatDate(invoice.issued_date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Due Date</p>
              <p className="text-sm font-medium mt-1">{formatDate(invoice.due_date)}</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Line items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Line Items</p>
            <div className="space-y-2">
              {invoice.line_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-medium">{formatCurrency(invoice.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount Paid</span>
              <span className="text-emerald-600 font-medium">{formatCurrency(invoice.amount_paid)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Balance Due</span>
              <span className={parseFloat(invoice.balance_due) > 0 ? 'text-red-600' : 'text-emerald-600'}>
                {formatCurrency(invoice.balance_due)}
              </span>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
