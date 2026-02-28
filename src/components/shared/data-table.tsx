'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from './empty-state'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  total?: number
  page?: number
  perPage?: number
  onPageChange?: (page: number) => void
  searchable?: boolean
  onSearch?: (query: string) => void
  searchPlaceholder?: string
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  actions?: React.ReactNode
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  total = 0,
  page = 1,
  perPage = 20,
  onPageChange,
  searchable,
  onSearch,
  searchPlaceholder = 'Search…',
  rowKey,
  onRowClick,
  emptyMessage,
  actions,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('')
  const totalPages = Math.ceil(total / perPage)

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value)
      onSearch?.(e.target.value)
    },
    [onSearch]
  )

  return (
    <div className="space-y-4">
      {(searchable || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                className="h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] pl-9 pr-3 text-sm text-[var(--text-primary)] shadow-sm placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-focus)] focus:outline-none"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearch}
              />
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full divide-y divide-[var(--border-default)]" role="grid">
            <thead className="sticky top-0 z-10 bg-[var(--surface-tertiary)]">
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]',
                      col.headerClassName
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--neutral-100)]">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {columns.map(col => (
                        <td key={col.key} className="px-4 py-3">
                          <Skeleton className="h-4 w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data.map(row => (
                    <tr
                      key={rowKey(row)}
                      className={cn(
                        'h-12 transition-colors',
                        onRowClick && 'cursor-pointer hover:bg-[var(--surface-secondary)]'
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map(col => (
                        <td
                          key={col.key}
                          className={cn('px-4 py-3 text-sm text-[var(--text-primary)]', col.className)}
                        >
                          {col.render
                            ? col.render(row)
                            : String((row as Record<string, unknown>)[col.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="space-y-3 p-3 md:hidden">
          {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-[var(--border-default)] p-3">
              <Skeleton className="mb-2 h-4 w-1/2" />
              <Skeleton className="mb-1 h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
          {!isLoading && data.map((row) => (
            <button
              key={rowKey(row)}
              className={cn(
                'w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] p-3 text-left',
                onRowClick && 'transition-colors hover:bg-[var(--surface-secondary)]'
              )}
              onClick={() => onRowClick?.(row)}
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {columns[0]?.render
                  ? columns[0].render(row)
                  : String((row as Record<string, unknown>)[columns[0]?.key] ?? '—')}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                {columns.slice(1, 4).map((col) => (
                  <div key={col.key}>
                    <p className="uppercase tracking-wide text-[10px] text-[var(--text-tertiary)]">{col.header}</p>
                    <div className="text-[var(--text-primary)]">
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </div>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        {!isLoading && data.length === 0 && (
          <EmptyState
            description={emptyMessage ?? 'No records found.'}
            className="py-12"
          />
        )}
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
          <span>
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => onPageChange(1)} disabled={page <= 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function TableSkeleton({ columns = 5, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <Skeleton className="h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
