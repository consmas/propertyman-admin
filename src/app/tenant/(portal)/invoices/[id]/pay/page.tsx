'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Smartphone, Building2, AlertCircle } from 'lucide-react'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { onlinePaymentsEndpoints } from '@/lib/api/endpoints/online-payments'
import { useTenantProfile } from '@/hooks/use-tenant'
import { PageHeader } from '@/components/shared/page-header'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, humanizeStatus } from '@/lib/utils'
import type { OnlinePaymentChannel, OnlinePaymentPurpose } from '@/types/api'

const CHANNELS: { value: OnlinePaymentChannel; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'mobile_money',
    label: 'Mobile Money',
    icon: <Smartphone className="h-5 w-5" />,
    description: 'Pay with MTN, Vodafone or AirtelTigo MoMo',
  },
  {
    value: 'card',
    label: 'Debit / Credit Card',
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Visa, Mastercard',
  },
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    icon: <Building2 className="h-5 w-5" />,
    description: 'Direct bank payment',
  },
]

function purposeForInvoiceType(type: string): OnlinePaymentPurpose {
  if (type === 'water' || type === 'electricity' || type === 'service_charge') return 'utilities'
  if (type === 'rent') return 'rent'
  return 'mixed'
}

export default function TenantPayPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [channel, setChannel] = useState<OnlinePaymentChannel>('mobile_money')
  const [partialAmount, setPartialAmount] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)

  const { data: invoiceRes, isLoading: loadingInvoice, isError: invoiceError, refetch } = useQuery({
    queryKey: ['tenant-invoice-detail', params.id],
    queryFn: () => invoicesEndpoints.get(params.id),
    enabled: Boolean(params.id),
  })

  const { data: tenantProfile, isLoading: loadingTenant } = useTenantProfile()

  const createIntent = useMutation({
    mutationFn: onlinePaymentsEndpoints.create,
    onSuccess: (res) => {
      const checkoutUrl = res.data?.checkout_url
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        setApiError('Payment initiated but no redirect URL was returned. Please contact support.')
      }
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { errors?: { detail?: string }[] } } })
          ?.response?.data?.errors?.[0]?.detail ?? 'Failed to initiate payment. Please try again.'
      setApiError(msg)
    },
  })

  if (loadingInvoice || loadingTenant) return <PageLoader />
  if (invoiceError || !invoiceRes?.data) {
    return <ErrorState message="Failed to load invoice" onRetry={() => refetch()} />
  }

  const invoice = invoiceRes.data
  const balance = invoice.balance ?? 0

  if (balance <= 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/tenant/invoices/${params.id}`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <PageHeader title="Invoice Already Paid" description="This invoice has no outstanding balance." />
        </div>
      </div>
    )
  }

  const amountToPay = partialAmount ? parseFloat(partialAmount) : balance
  const isValidAmount = amountToPay > 0 && amountToPay <= balance

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError(null)

    if (!tenantProfile) {
      setApiError('Could not find your tenant profile. Please refresh and try again.')
      return
    }
    if (!invoice.property_id) {
      setApiError('Invoice is missing property information.')
      return
    }

    createIntent.mutate({
      online_payment: {
        property_id: invoice.property_id,
        tenant_id: tenantProfile.id,
        invoice_id: invoice.id,
        amount: parseFloat(amountToPay.toFixed(2)),
        purpose: purposeForInvoiceType(invoice.invoice_type),
        channel,
        provider: 'hubtel',
      },
    })
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href={`/tenant/invoices/${params.id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <PageHeader
          title="Pay Invoice"
          description={`Invoice ${invoice.invoice_number} · Due ${formatDate(invoice.due_date)}`}
        />
      </div>

      {/* Invoice summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{humanizeStatus(invoice.invoice_type)}</p>
            <p className="mt-0.5 text-xs text-gray-400">{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Outstanding Balance</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(balance)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Channel selector */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Payment Method</p>
          <div className="space-y-2">
            {CHANNELS.map((ch) => (
              <button
                key={ch.value}
                type="button"
                onClick={() => setChannel(ch.value)}
                className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                  channel === ch.value
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className={channel === ch.value ? 'text-emerald-600' : 'text-gray-400'}>
                  {ch.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{ch.label}</p>
                  <p className="text-xs text-gray-500">{ch.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional partial amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount to Pay (GHS)
          </label>
          <input
            type="number"
            min="0.01"
            max={balance}
            step="0.01"
            placeholder={`Full balance: ${balance.toFixed(2)}`}
            value={partialAmount}
            onChange={(e) => setPartialAmount(e.target.value)}
            className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {partialAmount && !isValidAmount && (
            <p className="mt-1 text-xs text-red-500">
              Amount must be between 0.01 and {formatCurrency(balance)}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Leave blank to pay the full outstanding balance.
          </p>
        </div>

        {/* Error */}
        {apiError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        {/* Summary */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-800">You will pay</p>
            <p className="text-xl font-bold text-emerald-900">
              {isValidAmount ? formatCurrency(amountToPay) : formatCurrency(balance)}
            </p>
          </div>
          <p className="mt-1 text-xs text-emerald-700">
            You will be redirected to a secure payment page to complete the transaction.
          </p>
        </div>

        <Button
          type="submit"
          disabled={createIntent.isPending || (Boolean(partialAmount) && !isValidAmount)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-base font-semibold"
        >
          {createIntent.isPending ? 'Initiating payment…' : `Pay ${isValidAmount && partialAmount ? formatCurrency(amountToPay) : formatCurrency(balance)}`}
        </Button>
      </form>
    </div>
  )
}
