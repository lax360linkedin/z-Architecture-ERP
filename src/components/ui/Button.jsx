import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { classNames } from '../../utils/format'

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft disabled:bg-brand-300',
  secondary: 'bg-surface-raised text-ink border border-border hover:bg-surface-subtle',
  ghost: 'text-ink-muted hover:bg-surface-raised hover:text-ink',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-soft disabled:bg-red-300',
  outline: 'bg-transparent border border-border text-ink hover:bg-surface-raised',
  link: 'text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline p-0 h-auto',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9.5 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-9 w-9 justify-center',
}

export const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', className, loading, disabled, icon: Icon, iconRight: IconRight, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={classNames(
        'inline-flex items-center rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 focus-ring',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
      {!loading && IconRight ? <IconRight className="h-4 w-4" /> : null}
    </button>
  )
})
