import { classNames } from '../../utils/format'

export function Card({ children, className, padded = true, as: As = 'div', ...props }) {
  return (
    <As
      className={classNames(
        'rounded-xl border border-border bg-surface-raised shadow-card',
        padded && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </As>
  )
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={classNames('mb-4 flex items-start justify-between gap-3', className)}>
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function KPICard({ label, value, delta, deltaLabel, icon: Icon, trend = 'up', accent = 'brand' }) {
  const trendColor = trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-ink-muted'
  const accents = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300',
    success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
    info: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300',
  }
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted">{label}</span>
        {Icon && (
          <span className={classNames('flex h-8 w-8 items-center justify-center rounded-lg', accents[accent])}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight text-ink font-[Inter_Tight]">{value}</div>
      {delta != null && (
        <div className={classNames('flex items-center gap-1 text-xs font-medium', trendColor)}>
          <span>{delta}</span>
          {deltaLabel && <span className="text-ink-faint font-normal">{deltaLabel}</span>}
        </div>
      )}
    </Card>
  )
}

export function ChartCard({ title, subtitle, action, children, className }) {
  return (
    <Card className={classNames('flex flex-col', className)}>
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <div className="min-h-0 flex-1">{children}</div>
    </Card>
  )
}
