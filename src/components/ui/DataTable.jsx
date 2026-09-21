import { useMemo, useState } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown, SlidersHorizontal, Trash2 } from 'lucide-react'
import { classNames } from '../../utils/format'
import { Pagination } from './Pagination'
import { TableSkeleton } from './Skeleton'
import { EmptyState, ErrorState } from './EmptyState'
import { Checkbox } from './Input'
import { Dropdown, DropdownItem } from './Dropdown'
import { Button } from './Button'

export function DataTable({
  columns,
  data = [],
  loading,
  error,
  onRetry,
  getRowId = (row) => row.id,
  selectable = false,
  selected = [],
  onSelectedChange,
  sort,
  onSortChange,
  onRowClick,
  emptyState,
  bulkActions = [],
  page = 1,
  pageSize = 10,
  total = 0,
  totalPages = 1,
  onPageChange,
  toolbar,
}) {
  const [visibleKeys, setVisibleKeys] = useState(() => columns.map((c) => c.key))
  const visibleColumns = useMemo(() => columns.filter((c) => visibleKeys.includes(c.key)), [columns, visibleKeys])

  const allSelected = data.length > 0 && data.every((row) => selected.includes(getRowId(row)))
  const someSelected = selected.length > 0 && !allSelected

  function toggleAll() {
    if (allSelected) onSelectedChange(selected.filter((id) => !data.some((r) => getRowId(r) === id)))
    else onSelectedChange([...new Set([...selected, ...data.map(getRowId)])])
  }

  function toggleRow(id) {
    onSelectedChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  }

  return (
    <div className="flex flex-col">
      {(toolbar || columns.length > 3) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex flex-1 flex-wrap items-center gap-2">{toolbar}</div>
          <Dropdown
            align="right"
            trigger={
              <Button variant="secondary" size="sm" icon={SlidersHorizontal}>
                Columns
              </Button>
            }
          >
            <div className="max-h-72 overflow-y-auto p-1">
              {columns.map((c) => (
                <label key={c.key} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-surface-subtle cursor-pointer">
                  <Checkbox
                    checked={visibleKeys.includes(c.key)}
                    onChange={() =>
                      setVisibleKeys((prev) => (prev.includes(c.key) ? prev.filter((k) => k !== c.key) : [...prev, c.key]))
                    }
                  />
                  {c.header}
                </label>
              ))}
            </div>
          </Dropdown>
        </div>
      )}

      {selectable && selected.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-b border-border bg-brand-50 px-4 py-2.5 dark:bg-brand-950/30">
          <p className="text-xs font-medium text-brand-700 dark:text-brand-300">{selected.length} selected</p>
          <div className="flex items-center gap-2">
            {bulkActions.map((a) => (
              <Button key={a.label} size="sm" variant="secondary" icon={a.icon || Trash2} onClick={() => a.onClick(selected)}>
                {a.label}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => onSelectedChange([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-ink-muted">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <Checkbox checked={allSelected} ref={(el) => el && (el.indeterminate = someSelected)} onChange={toggleAll} />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={classNames('whitespace-nowrap px-4 py-3 font-medium', col.className)}
                  style={{ width: col.width }}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => onSortChange?.(col.key)}
                      className="inline-flex items-center gap-1 hover:text-ink"
                    >
                      {col.header}
                      {sort?.by === col.key ? (
                        sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0)}>
                  <TableSkeleton cols={visibleColumns.length + (selectable ? 1 : 0)} />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0)}>
                  <ErrorState description={error} onRetry={onRetry} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0)}>
                  <EmptyState title={emptyState?.title || 'No records found'} description={emptyState?.description} action={emptyState?.action} />
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const id = getRowId(row)
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    className={classNames(
                      'border-b border-border-subtle transition-colors last:border-0',
                      onRowClick && 'cursor-pointer hover:bg-surface-subtle'
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selected.includes(id)} onChange={() => toggleRow(id)} />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td key={col.key} className={classNames('px-4 py-3 align-middle text-ink', col.className)}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && data.length > 0 && onPageChange && (
        <Pagination page={page} pageSize={pageSize} total={total} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  )
}
