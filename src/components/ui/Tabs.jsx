import { useState } from 'react'
import { classNames } from '../../utils/format'

export function Tabs({ tabs, value, onChange, className }) {
  const [internal, setInternal] = useState(tabs[0]?.value)
  const active = value ?? internal
  const setActive = onChange ?? setInternal

  return (
    <div className={classNames('scrollbar-none flex gap-1 overflow-x-auto border-b border-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setActive(tab.value)}
          className={classNames(
            'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors focus-ring',
            active === tab.value ? 'text-brand-600' : 'text-ink-muted hover:text-ink'
          )}
        >
          {tab.icon && <tab.icon className="h-4 w-4" />}
          {tab.label}
          {tab.count != null && (
            <span className={classNames('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', active === tab.value ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : 'bg-surface-subtle text-ink-faint')}>
              {tab.count}
            </span>
          )}
          {active === tab.value && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600" />
          )}
        </button>
      ))}
    </div>
  )
}

export function Pills({ options, value, onChange, className }) {
  return (
    <div className={classNames('inline-flex items-center gap-1 rounded-lg bg-surface-subtle p-1', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={classNames(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-ring',
            value === opt.value ? 'bg-surface-raised text-ink shadow-soft' : 'text-ink-muted hover:text-ink'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
