'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { billingEndpoints } from '@/lib/api/endpoints/billing'
import { useCurrentPropertyId } from '@/hooks/use-property'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/error-state'

function WaterBillingInner() {
  const propertyId = useCurrentPropertyId()
  const [billingMonth, setBillingMonth] = useState('')
  const [result, setResult] = useState<string>('')

  const runBilling = useMutation({
    mutationFn: billingEndpoints.runWaterInvoices,
    onSuccess: (res) => {
      setResult(`Created ${res.data.invoices_created} invoice(s) for ${res.data.billing_month}`)
    },
    onError: (error) => {
      setResult(getErrorMessage(error))
    },
  })

  if (!propertyId) return <ErrorState title="No property selected" message="Select a property before running billing." />

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Water Billing Run" description="Generate monthly water invoices" />
      <Card className="p-6 space-y-4">
        <label className="text-sm font-medium text-gray-700">Billing Month (optional)</label>
        <input type="date" value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)} className="h-9 w-full rounded-md border px-3 text-sm" />
        <Button
          onClick={() => runBilling.mutate({ property_id: propertyId, billing_month: billingMonth || undefined })}
          loading={runBilling.isPending}
        >
          Run Billing
        </Button>
        {result && <p className={runBilling.isError ? 'text-sm text-red-600' : 'text-sm text-emerald-700'}>{result}</p>}
      </Card>
    </div>
  )
}

export default function WaterBillingPage() {
  return <RoleGate roles={['owner', 'admin', 'accountant']}><WaterBillingInner /></RoleGate>
}
