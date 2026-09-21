export function formatCurrency(value, { compact = false } = {}) {
  if (value == null || Number.isNaN(value)) return '₹0'
  const n = Number(value)
  if (compact) {
    if (Math.abs(n) >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`
    if (Math.abs(n) >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`
    if (Math.abs(n) >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatNumber(value) {
  if (value == null) return '0'
  return new Intl.NumberFormat('en-IN').format(value)
}

export function formatDate(value, { withTime = false } = {}) {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '—'
  const opts = { day: '2-digit', month: 'short', year: 'numeric' }
  if (withTime) {
    opts.hour = '2-digit'
    opts.minute = '2-digit'
  }
  return new Intl.DateTimeFormat('en-IN', opts).format(d)
}

export function formatRelativeTime(value) {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.round(diffMs / 60000)
  if (Math.abs(diffMin) < 1) return 'just now'
  if (Math.abs(diffMin) < 60) return diffMin > 0 ? `${diffMin}m ago` : `in ${-diffMin}m`
  const diffHr = Math.round(diffMin / 60)
  if (Math.abs(diffHr) < 24) return diffHr > 0 ? `${diffHr}h ago` : `in ${-diffHr}h`
  const diffDay = Math.round(diffHr / 24)
  if (Math.abs(diffDay) < 30) return diffDay > 0 ? `${diffDay}d ago` : `in ${-diffDay}d`
  return formatDate(d)
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function formatPercent(value, digits = 0) {
  if (value == null) return '0%'
  return `${Number(value).toFixed(digits)}%`
}

export function classNames(...args) {
  return args.filter(Boolean).join(' ')
}
