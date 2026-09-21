import { classNames } from '../../utils/format'

export function ProgressBar({ value = 0, className, color = 'brand', size = 'md', showLabel = false }) {
  const clamped = Math.max(0, Math.min(100, value))
  const colors = {
    brand: 'bg-brand-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  }
  const dynamicColor = color === 'auto' ? (clamped >= 90 ? 'bg-emerald-500' : clamped >= 50 ? 'bg-brand-600' : clamped >= 25 ? 'bg-amber-500' : 'bg-red-500') : colors[color]
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' }

  return (
    <div className={classNames('flex items-center gap-2', className)}>
      <div className={classNames('flex-1 overflow-hidden rounded-full bg-surface-subtle', heights[size])}>
        <div
          className={classNames('h-full rounded-full transition-all duration-500', dynamicColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <span className="w-9 shrink-0 text-right text-xs font-medium text-ink-muted">{clamped}%</span>}
    </div>
  )
}
