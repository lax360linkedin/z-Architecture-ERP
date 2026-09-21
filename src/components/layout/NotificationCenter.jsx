import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Dropdown } from '../ui/Dropdown'
import { Badge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'
import { classNames, formatRelativeTime } from '../../utils/format'
import { notificationsApi } from '../../api/notificationsApi'

export function NotificationCenter() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    notificationsApi.list().then((list) => {
      setItems(list)
      setLoading(false)
    })
  }, [])

  const unread = items.filter((n) => !n.read).length

  async function markAllRead() {
    const updated = await notificationsApi.markAllRead()
    setItems(updated)
  }

  async function openNotification(n) {
    if (!n.read) {
      await notificationsApi.markRead(n.id)
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    }
    navigate(n.link)
  }

  return (
    <Dropdown
      width="w-96"
      trigger={
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-raised hover:text-ink focus-ring">
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
      }
    >
      <div className="flex items-center justify-between px-2.5 py-2">
        <p className="text-sm font-semibold text-ink">Notifications</p>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? null : items.length === 0 ? (
          <EmptyState title="You're all caught up" description="No notifications right now." />
        ) : (
          items.map((n) => (
            <button
              key={n.id}
              onClick={() => openNotification(n)}
              className={classNames('flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-surface-subtle', !n.read && 'bg-brand-50/60 dark:bg-brand-950/20')}
            >
              <span className={classNames('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-brand-500')} />
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-ink leading-snug">{n.title}</span>
                <span className="mt-1 flex items-center gap-2">
                  <Badge color="neutral" className="text-[10px]">{n.category}</Badge>
                  <span className="text-[11px] text-ink-faint">{formatRelativeTime(n.time)}</span>
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </Dropdown>
  )
}
