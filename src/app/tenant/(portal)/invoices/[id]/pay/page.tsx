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
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
      <div className="fade-up space-y-6">
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
    <div className="fade-up space-y-6 max-w-xl">
      {/* Header */}
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
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              {humanizeStatus(invoice.invoice_type)}
            </p>
            <p className="mt-0.5 font-mono text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
              {invoice.invoice_number}
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.07em]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Outstanding Balance
            </p>
            <p className="font-display text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Channel selector */}
        <Card className="p-5">
          <p
            className="text-[13px] font-semibold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Payment Method
          </p>
          <div className="space-y-2">
            {CHANNELS.map((ch) => (
              <button
                key={ch.value}
                type="button"
                onClick={() => setChannel(ch.value)}
                className="w-full flex items-center gap-3 rounded-xl p-4 text-left transition-all"
                style={{
                  border: channel === ch.value
                    ? '2px solid var(--brand-600)'
                    : '1.5px solid var(--border-default)',
                  background: channel === ch.value ? 'var(--brand-50)' : 'var(--surface-primary)',
                }}
              >
                <span style={{ color: channel === ch.value ? 'var(--brand-600)' : 'var(--text-tertiary)' }}>
                  {ch.icon}
                </span>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {ch.label}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    {ch.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Partial amount */}
        <Card className="p-5">
          <Input
            type="number"
            min="0.01"
            max={balance}
            step="0.01"
            label="Amount to Pay"
            placeholder={`Full balance: ${balance.toFixed(2)}`}
            value={partialAmount}
            onChange={(e) => setPartialAmount(e.target.value)}
            error={partialAmount && !isValidAmount ? `Must be between 0.01 and ${formatCurrency(balance)}` : undefined}
          />
          <p className="mt-1.5 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            Leave blank to pay the full outstanding balance.
          </p>
        </Card>

        {/* Error */}
        {apiError && (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{
              border: '1px solid var(--error-500)',
              background: 'var(--error-50)',
            }}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--error-500)' }} />
            <p className="text-[13px]" style={{ color: 'var(--error-500)' }}>{apiError}</p>
          </div>
        )}

        {/* Summary */}
        <div
          className="rounded-xl px-4 py-4"
          style={{
            border: '1px solid var(--brand-200)',
            background: 'var(--brand-50)',
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold" style={{ color: 'var(--brand-700)' }}>
              You will pay
            </p>
            <p className="font-display text-[20px] font-bold" style={{ color: 'var(--brand-700)' }}>
              {isValidAmount ? formatCurrency(amountToPay) : formatCurrency(balance)}
            </p>
          </div>
          <p className="mt-1 text-[12px]" style={{ color: 'var(--brand-600)' }}>
            You will be redirected to a secure payment page to complete the transaction.
          </p>
        </div>

        <Button
          type="submit"
          disabled={createIntent.isPending || (Boolean(partialAmount) && !isValidAmount)}
          loading={createIntent.isPending}
          className="w-full h-11 text-[15px] font-semibold"
        >
          {createIntent.isPending
            ? 'Initiating payment…'
            : `Pay ${isValidAmount && partialAmount ? formatCurrency(amountToPay) : formatCurrency(balance)}`}
        </Button>
      </form>
    </div>
  )
}
