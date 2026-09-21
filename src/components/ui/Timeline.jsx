import { classNames } from '../../utils/format'
import { formatRelativeTime } from '../../utils/format'

export function Timeline({ items, renderContent }) {
  return (
    <div className="relative">
      {items.map((item, idx) => (
        <div key={item.id ?? idx} className="relative flex gap-3 pb-6 last:pb-0">
          {idx !== items.length - 1 && (
            <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
          )}
          <span
            className={classNames(
              'relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-surface-raised',
              item.color || 'bg-brand-500'
            )}
          />
          <div className="flex-1 pb-1">
            {renderContent ? (
              renderContent(item)
            ) : (
              <>
                <p className="text-sm text-ink">{item.title}</p>
                {item.time && <p className="mt-0.5 text-xs text-ink-faint">{formatRelativeTime(item.time)}</p>}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
