import { ChevronLeft, ChevronRight } from 'lucide-react'
import { classNames } from '../../utils/format'

export function Pagination({ page, totalPages, total, pageSize, onPageChange }) {
  if (totalPages <= 1 && total <= pageSize) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  const pages = []
  const windowSize = 1
  for (let p = 1; p <= totalPages; p += 1) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= windowSize) pages.push(p)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <p className="text-xs text-ink-muted">
        Showing <span className="font-medium text-ink">{total === 0 ? 0 : start}</span>–<span className="font-medium text-ink">{end}</span> of{' '}
        <span className="font-medium text-ink">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface-subtle disabled:opacity-40 disabled:hover:bg-transparent focus-ring"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-1.5 text-xs text-ink-faint">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={classNames(
                'h-8 min-w-8 rounded-md px-2 text-xs font-medium transition-colors focus-ring',
                p === page ? 'bg-brand-600 text-white' : 'text-ink-muted hover:bg-surface-subtle'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface-subtle disabled:opacity-40 disabled:hover:bg-transparent focus-ring"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
