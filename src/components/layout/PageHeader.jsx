import { classNames } from '../../utils/format'

export function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={classNames('flex flex-col gap-3 border-b border-border bg-surface-raised px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6', className)}>
      <div className="min-w-0">
        <h1 className="text-lg font-bold tracking-tight text-ink font-[Inter_Tight] sm:text-xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function PageBody({ children, className }) {
  return <div className={classNames('p-4 sm:p-6', className)}>{children}</div>
}
