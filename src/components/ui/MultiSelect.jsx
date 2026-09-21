import { useState } from 'react'
import { ChevronDown, X, Check } from 'lucide-react'
import { classNames } from '../../utils/format'
import { Dropdown } from './Dropdown'

export function MultiSelect({ options, value = [], onChange, placeholder = 'Select…' }) {
  return (
    <Dropdown
      width="w-64"
      align="left"
      trigger={
        <button
          type="button"
          className="flex h-9.5 w-full items-center justify-between rounded-lg border border-border bg-surface-raised px-3 text-left text-sm text-ink focus-ring"
        >
          <span className={classNames('truncate', value.length === 0 && 'text-ink-faint')}>
            {value.length === 0 ? placeholder : `${value.length} selected`}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint" />
        </button>
      }
    >
      <div className="max-h-64 overflow-y-auto p-1">
        {options.map((opt) => {
          const checked = value.includes(opt.value)
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange(checked ? value.filter((v) => v !== opt.value) : [...value, opt.value])}
              className="flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-surface-subtle"
            >
              <span>{opt.label}</span>
              {checked && <Check className="h-4 w-4 text-brand-600" />}
            </button>
          )
        })}
      </div>
    </Dropdown>
  )
}

export function MultiSelectChips({ options, value = [], onChange }) {
  const selectedOptions = options.filter((o) => value.includes(o.value))
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {selectedOptions.map((o) => (
        <span key={o.value} className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          {o.label}
          <button onClick={() => onChange(value.filter((v) => v !== o.value))}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <MultiSelect options={options} value={value} onChange={onChange} placeholder="Add…" />
    </div>
  )
}
