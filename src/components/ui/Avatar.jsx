import { initials, classNames } from '../../utils/format'

const palette = ['#6a3aec', '#5b28d8', '#7c5cf6', '#4b21b3', '#3f1d92', '#9b8afb']

function colorFor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

const sizes = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' }

export function Avatar({ name, size = 'md', className, ring = false }) {
  return (
    <span
      className={classNames(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none',
        sizes[size],
        ring && 'ring-2 ring-surface',
        className
      )}
      style={{ backgroundColor: colorFor(name) }}
      title={name}
    >
      {initials(name) || '?'}
    </span>
  )
}

export function AvatarGroup({ names = [], max = 4, size = 'sm' }) {
  const shown = names.slice(0, max)
  const rest = names.length - shown.length
  return (
    <div className="flex -space-x-2">
      {shown.map((n, i) => (
        <Avatar key={i} name={n} size={size} ring />
      ))}
      {rest > 0 && (
        <span className={classNames('inline-flex items-center justify-center rounded-full bg-surface-subtle text-ink-muted ring-2 ring-surface font-medium', sizes[size])}>
          +{rest}
        </span>
      )}
    </div>
  )
}
