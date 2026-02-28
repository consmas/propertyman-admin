'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invoicesEndpoints } from '@/lib/api/endpoints/invoices'
import { invoiceItemsEndpoints } from '@/lib/api/endpoints/invoice-items'
import { getErrorMessage } from '@/lib/errors'
import { RoleGate } from '@/components/shared/role-gate'
import { PageHeader } from '@/components/shared/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/error-state'
import { PageLoader } from '@/components/shared/loading-spinner'
import { formatCents, formatDate } from '@/lib/utils'

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().min(1),
  unit_price: z.coerce.number().min(0),
})

type ItemValues = z.infer<typeof itemSchema>

function InvoiceDetailInner() {
  const params = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const invoiceQuery = useQuery({ queryKey: ['invoices', params.id], queryFn: () => invoicesEndpoints.get(params.id) })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ItemValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { quantity: 1, unit_price: 0 },
  })

  const createItem = useMutation({
    mutationFn: (values: ItemValues) =>
      invoiceItemsEndpoints.create(params.id, {
        invoice_item: {
          description: values.description,
          quantity: values.quantity,
          unit_price_cents: Math.round(values.unit_price * 100),
        },
      }),
    onSuccess: () => {
      toast.success('Item added')
      reset()
      queryClient.invalidateQueries({ queryKey: ['invoices', params.id] })
    },
    onError: (error) => setServerError(getErrorMessage(error)),
  })

  const updateItem = useMutation({
    mutationFn: (payload: {
      id: string
      description: string
      quantity: number
      unit_price_cents: number
    }) =>
      invoiceItemsEndpoints.update(payload.id, {
        invoice_item: {
          description: payload.description,
          quantity: payload.quantity,
          unit_price_cents: payload.unit_price_cents,
        },
      }),
    onSuccess: () => {
      toast.success('Item updated')
      queryClient.invalidateQueries({ queryKey: ['invoices', params.id] })
    },
    onError: (error) => setServerError(getErrorMessage(error)),
  })

  const deleteItem = useMutation({
    mutationFn: (id: string) => invoiceItemsEndpoints.remove(id),
    onSuccess: () => {
      toast.success('Item removed')
      queryClient.invalidateQueries({ queryKey: ['invoices', params.id] })
    },
    onError: (error) => setServerError(getErrorMessage(error)),
  })

  if (invoiceQuery.isLoading) return <PageLoader />
  if (invoiceQuery.isError || !invoiceQuery.data?.data) return <ErrorState message="Failed to load invoice" onRetry={() => invoiceQuery.refetch()} />

  const invoice = invoiceQuery.data.data
  const items = (invoice as unknown as { items?: Array<{ id: string; description: string; quantity: number; unit_price_cents: number; amount_cents: number }> }).items ?? []

  return (
    <div className="space-y-6">
      <PageHeader title={`Invoice ${invoice.invoice_number}`} description={`${invoice.invoice_type} • ${invoice.status}`} actions={<Link href={`/app/invoices/${invoice.id}/edit`}><Button>Edit</Button></Link>} />

      <Card className="p-6 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        <p>Issued: {formatDate(invoice.issued_on)}</p>
        <p>Due: {formatDate(invoice.due_on)}</p>
        <p>Total: {formatCents(invoice.amount_cents)}</p>
        <p>Balance: {formatCents(invoice.balance_cents)}</p>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Invoice Items</h3>
        <div className="space-y-2">
          {items.length === 0 && <p className="text-sm text-gray-500">No items yet.</p>}
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded border p-2 text-sm">
              <div><p>{item.description}</p><p className="text-xs text-gray-500">{item.quantity} × {formatCents(item.unit_price_cents)}</p></div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{formatCents(item.amount_cents)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const description = window.prompt('Description', item.description) ?? item.description
                    const quantityInput = window.prompt('Quantity', String(item.quantity))
                    const priceInput = window.prompt('Unit price', String(item.unit_price_cents / 100))
                    const quantity = Number(quantityInput)
                    const unitPrice = Number(priceInput)
                    if (!Number.isFinite(quantity) || quantity <= 0) return
                    if (!Number.isFinite(unitPrice) || unitPrice < 0) return
                    updateItem.mutate({
                      id: item.id,
                      description,
                      quantity,
                      unit_price_cents: Math.round(unitPrice * 100),
                    })
                  }}
                  loading={updateItem.isPending}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteItem.mutate(item.id)}
                  loading={deleteItem.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit((values) => createItem.mutate(values))} className="grid grid-cols-1 gap-2 md:grid-cols-4">
          <input {...register('description')} placeholder="Description" className="h-9 rounded-md border px-3 text-sm md:col-span-2" />
          <input {...register('quantity')} type="number" placeholder="Qty" className="h-9 rounded-md border px-3 text-sm" />
          <input {...register('unit_price')} type="number" step="0.01" placeholder="Unit price" className="h-9 rounded-md border px-3 text-sm" />
          <div className="md:col-span-4"><Button type="submit" loading={createItem.isPending}>Add Item</Button></div>
          {(errors.description || errors.quantity || errors.unit_price || serverError) && (
            <p className="text-sm text-red-600 md:col-span-4">{errors.description?.message || errors.quantity?.message || errors.unit_price?.message || serverError}</p>
          )}
        </form>
      </Card>
    </div>
  )
}

export default function InvoiceDetailPage() {
  return <RoleGate roles={['owner', 'admin', 'property_manager', 'accountant']}><InvoiceDetailInner /></RoleGate>
}
