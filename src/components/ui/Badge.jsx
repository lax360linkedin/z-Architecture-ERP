import { classNames } from '../../utils/format'
import { STATUS_COLORS } from '../../utils/constants'

const colorClasses = {
  neutral: 'bg-surface-raised text-ink-muted border-border',
  brand: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-800',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
}

export function Badge({ children, color = 'neutral', className, dot = false }) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        colorClasses[color] || colorClasses.neutral,
        className
      )}
    >
      {dot && <span className={classNames('h-1.5 w-1.5 rounded-full', dotColor(color))} />}
      {children}
    </span>
  )
}

function dotColor(color) {
  const map = {
    neutral: 'bg-ink-faint', brand: 'bg-brand-500', success: 'bg-emerald-500',
    warning: 'bg-amber-500', danger: 'bg-red-500', info: 'bg-sky-500',
  }
  return map[color] || map.neutral
}

export function StatusBadge({ status, className }) {
  if (!status) return null
  const key = String(status).toLowerCase()
  const color = STATUS_COLORS[key] || 'neutral'
  const label = status
    .toString()
    .split(/[-_]/)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ')
  return (
    <Badge color={color} dot className={className}>
      {label}
    </Badge>
  )
}
