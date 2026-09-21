import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Hash, Users2, MessageCircle } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { communicationApi } from '../../api/notificationsApi'
import { getEmployeeName } from '../../data/employees'
import { formatRelativeTime, classNames } from '../../utils/format'

const GROUP_LABELS = { project: 'Project Channels', group: 'Groups', direct: 'Direct Messages' }
const GROUP_ORDER = ['project', 'group', 'direct']

export default function Communication() {
  const { user } = useAuth()
  const [channels, setChannels] = useState([])
  const [activeChannelId, setActiveChannelId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    communicationApi.channels().then((chs) => {
      setChannels(chs)
      setLoadingChannels(false)
      if (chs.length > 0) setActiveChannelId(chs[0].id)
    })
  }, [])

  useEffect(() => {
    if (!activeChannelId) return
    setLoadingMessages(true)
    communicationApi.messages(activeChannelId).then((msgs) => {
      setMessages(msgs)
      setLoadingMessages(false)
    })
  }, [activeChannelId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const grouped = useMemo(() => {
    const map = { project: [], group: [], direct: [] }
    channels.forEach((c) => {
      if (map[c.type]) map[c.type].push(c)
    })
    return map
  }, [channels])

  const activeChannel = channels.find((c) => c.id === activeChannelId)

  async function handleSend(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !activeChannelId) return
    const optimistic = { from: user?.id, text, time: new Date().toISOString() }
    setMessages((prev) => [...prev, optimistic])
    setDraft('')
    setSending(true)
    try {
      await communicationApi.sendMessage(activeChannelId, { from: user?.id, text })
      setChannels((prev) => prev.map((c) => (c.id === activeChannelId ? { ...c, unread: 0 } : c)))
    } finally {
      setSending(false)
    }
  }

  function selectChannel(id) {
    setActiveChannelId(id)
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  }

  return (
    <div>
      <PageHeader title="Communication" subtitle="Project channels, team groups and direct messages" />
      <PageBody>
        <Card padded={false} className="flex h-[calc(100vh-10.5rem)] min-h-[420px] overflow-hidden">
          <div className="flex w-72 shrink-0 flex-col border-r border-border">
            <div className="overflow-y-auto">
              {loadingChannels ? (
                <div className="flex flex-col gap-2 p-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
                </div>
              ) : channels.length === 0 ? (
                <EmptyState title="No channels" className="px-4 py-10" />
              ) : (
                GROUP_ORDER.map((type) =>
                  grouped[type].length === 0 ? null : (
                    <div key={type} className="mb-2">
                      <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">{GROUP_LABELS[type]}</p>
                      <div className="flex flex-col">
                        {grouped[type].map((c) => (
                          <button
                            key={c.id}
                            onClick={() => selectChannel(c.id)}
                            className={classNames(
                              'flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors',
                              activeChannelId === c.id ? 'bg-brand-50 dark:bg-brand-950/40' : 'hover:bg-surface-subtle'
                            )}
                          >
                            {c.type === 'direct' ? (
                              <Avatar name={c.name} size="sm" />
                            ) : (
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-ink-faint">
                                {c.type === 'project' ? <Hash className="h-4 w-4" /> : <Users2 className="h-4 w-4" />}
                              </span>
                            )}
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{c.name}</span>
                            {c.unread > 0 && (
                              <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
                                {c.unread}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            {!activeChannel ? (
              <div className="flex flex-1 items-center justify-center">
                <EmptyState icon={MessageCircle} title="Select a channel" description="Choose a channel from the left to start messaging." />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
                  {activeChannel.type === 'direct' ? (
                    <Avatar name={activeChannel.name} size="sm" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-subtle text-ink-faint">
                      {activeChannel.type === 'project' ? <Hash className="h-4 w-4" /> : <Users2 className="h-4 w-4" />}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-ink">{activeChannel.name}</p>
                    <p className="text-xs text-ink-faint">{activeChannel.members.length} member{activeChannel.members.length === 1 ? '' : 's'}</p>
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
                  {loadingMessages ? (
                    <div className="flex flex-col gap-3">
                      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-2/3" />)}
                    </div>
                  ) : messages.length === 0 ? (
                    <EmptyState title="No messages yet" description="Say hello to start the conversation." />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {messages.map((m, i) => {
                        const mine = m.from === user?.id
                        return (
                          <div key={i} className={classNames('flex flex-col', mine ? 'items-end' : 'items-start')}>
                            {!mine && <p className="mb-0.5 px-1 text-xs font-medium text-ink-faint">{getEmployeeName(m.from)}</p>}
                            <div
                              className={classNames(
                                'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
                                mine ? 'rounded-br-sm bg-brand-600 text-white' : 'rounded-bl-sm bg-surface-subtle text-ink'
                              )}
                            >
                              {m.text}
                            </div>
                            <p className="mt-0.5 px-1 text-[10px] text-ink-faint">{formatRelativeTime(m.time)}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border px-4 py-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Message ${activeChannel.name}…`}
                    className="h-10 flex-1 rounded-lg border border-border bg-surface-raised px-3.5 text-sm text-ink placeholder:text-ink-faint focus-ring"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </Card>
      </PageBody>
    </div>
  )
}
