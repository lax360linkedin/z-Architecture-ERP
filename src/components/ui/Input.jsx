import { forwardRef } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { classNames } from '../../utils/format'

const baseField =
  'w-full rounded-lg border border-border bg-surface-raised px-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus-ring disabled:opacity-60 disabled:cursor-not-allowed'

export function Field({ label, htmlFor, required, error, hint, children, className }) {
  return (
    <div className={classNames('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-xs font-medium text-ink-muted">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? <p className="text-xs text-red-500">{error}</p> : hint ? <p className="text-xs text-ink-faint">{hint}</p> : null}
    </div>
  )
}

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={classNames(baseField, 'h-9.5', error && 'border-red-400 focus-visible:ring-red-400', className)}
      {...props}
    />
  )
})

export const Textarea = forwardRef(function Textarea({ className, error, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={classNames(baseField, 'py-2 resize-y', error && 'border-red-400 focus-visible:ring-red-400', className)}
      {...props}
    />
  )
})

export const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={classNames(baseField, 'h-9.5 appearance-none pr-8', error && 'border-red-400 focus-visible:ring-red-400', className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
    </div>
  )
})

export function SearchInput({ value, onChange, placeholder = 'Search…', className, ...props }) {
  return (
    <div className={classNames('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={classNames(baseField, 'h-9.5 pl-9')}
        {...props}
      />
    </div>
  )
}

export const Checkbox = forwardRef(function Checkbox({ label, className, ...props }, ref) {
  return (
    <label className={classNames('inline-flex items-center gap-2 text-sm text-ink cursor-pointer select-none', className)}>
      <input ref={ref} type="checkbox" className="h-4 w-4 rounded border-border text-brand-600 focus-ring accent-brand-600" {...props} />
      {label}
    </label>
  )
})
