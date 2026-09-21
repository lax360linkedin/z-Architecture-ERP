import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarClock, MapPin } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Pills } from '../../components/ui/Tabs'
import { Badge } from '../../components/ui/Badge'
import { Drawer } from '../../components/ui/Drawer'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { calendarApi } from '../../api/calendarApi'
import { classNames } from '../../utils/format'

const TODAY = new Date('2024-09-19')

const TYPE_COLORS = {
  Meeting: 'info',
  'Site Visit': 'warning',
  Milestone: 'brand',
  Interview: 'success',
  Payment: 'danger',
  Task: 'neutral',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isSameDate(a, b) {
  return dateKey(a) === dateKey(b)
}

function addDays(d, n) {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

function getMonthGrid(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay())
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
}

function getWeekDays(date) {
  const start = addDays(date, -date.getDay())
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

function formatFull(d) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

function formatShort(d) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(d)
}

export default function CalendarPage() {
  const [view, setView] = useState('month')
  const [cursor, setCursor] = useState(TODAY)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    calendarApi.events().then((evts) => {
      setEvents(evts)
      setLoading(false)
    })
  }, [])

  const eventsByDate = useMemo(() => {
    const map = {}
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return map
  }, [events])

  function eventsOn(d) {
    return eventsByDate[dateKey(d)] || []
  }

  function shift(delta) {
    if (view === 'month') setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1))
    else if (view === 'week') setCursor((c) => addDays(c, delta * 7))
    else if (view === 'day') setCursor((c) => addDays(c, delta))
  }

  const monthGrid = useMemo(() => getMonthGrid(cursor), [cursor])
  const weekDays = useMemo(() => getWeekDays(cursor), [cursor])

  const agendaGroups = useMemo(() => {
    const upcoming = events.filter((e) => new Date(e.date) >= new Date(dateKey(TODAY)))
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date))
    const groups = []
    upcoming.forEach((e) => {
      let group = groups.find((g) => g.date === e.date)
      if (!group) {
        group = { date: e.date, items: [] }
        groups.push(group)
      }
      group.items.push(e)
    })
    return groups
  }, [events])

  const headerLabel = (() => {
    if (view === 'month') return `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`
    if (view === 'week') return `${formatShort(weekDays[0])} – ${formatShort(weekDays[6])}, ${weekDays[0].getFullYear()}`
    if (view === 'day') return formatFull(cursor)
    return 'All Upcoming Events'
  })()

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Meetings, site visits, milestones, interviews and payment dates in one view"
        actions={<Pills value={view} onChange={setView} options={[{ value: 'month', label: 'Month' }, { value: 'week', label: 'Week' }, { value: 'day', label: 'Day' }, { value: 'agenda', label: 'Agenda' }]} />}
      />
      <PageBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {view !== 'agenda' && (
              <>
                <Button size="icon" variant="secondary" onClick={() => shift(-1)} aria-label="Previous">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" onClick={() => shift(1)} aria-label="Next">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" icon={CalendarClock} onClick={() => setCursor(TODAY)}>
                  Today
                </Button>
              </>
            )}
            <h2 className="ml-1 text-base font-semibold text-ink">{headerLabel}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <span key={type} className="flex items-center gap-1.5 text-xs text-ink-muted">
                <span className={classNames('h-2 w-2 rounded-full', dotColor(color))} />
                {type}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-[480px] w-full" />
        ) : view === 'month' ? (
          <Card padded={false} className="overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border bg-surface-subtle text-xs font-medium text-ink-muted">
              {WEEKDAYS.map((w) => (
                <div key={w} className="px-2 py-2 text-center">{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthGrid.map((d, i) => {
                const inMonth = d.getMonth() === cursor.getMonth()
                const isToday = isSameDate(d, TODAY)
                const dayEvents = eventsOn(d)
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(d)}
                    className={classNames(
                      'flex min-h-[104px] flex-col items-stretch gap-1 border-b border-r border-border-subtle p-1.5 text-left align-top transition-colors last:border-r-0 hover:bg-surface-subtle',
                      !inMonth && 'bg-surface-subtle/40 text-ink-faint'
                    )}
                  >
                    <span className={classNames('flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium', isToday ? 'bg-brand-600 text-white' : inMonth ? 'text-ink' : 'text-ink-faint')}>
                      {d.getDate()}
                    </span>
                    <div className="flex flex-col gap-1">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span key={e.id} className={classNames('truncate rounded px-1.5 py-0.5 text-[10px] font-medium', badgeBg(TYPE_COLORS[e.type]))}>
                          {e.title}
                        </span>
                      ))}
                      {dayEvents.length > 3 && <span className="px-1.5 text-[10px] font-medium text-ink-faint">+{dayEvents.length - 3} more</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        ) : view === 'week' ? (
          <div className="flex flex-col gap-3">
            {weekDays.map((d) => (
              <DayAgendaRow key={dateKey(d)} date={d} events={eventsOn(d)} isToday={isSameDate(d, TODAY)} onClick={() => setSelectedDay(d)} />
            ))}
          </div>
        ) : view === 'day' ? (
          <Card>
            {eventsOn(cursor).length === 0 ? (
              <EmptyState title="No events on this day" description="Nothing scheduled — enjoy the breathing room." />
            ) : (
              <div className="flex flex-col divide-y divide-border-subtle">
                {eventsOn(cursor).map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </div>
            )}
          </Card>
        ) : (
          <div className="flex flex-col gap-5">
            {agendaGroups.length === 0 ? (
              <Card><EmptyState title="No upcoming events" description="You're all clear for now." /></Card>
            ) : (
              agendaGroups.map((g) => (
                <div key={g.date}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    {formatFull(new Date(`${g.date}T00:00:00`))} {isSameDate(new Date(`${g.date}T00:00:00`), TODAY) && <span className="ml-1 text-brand-600">· Today</span>}
                  </p>
                  <Card padded={false}>
                    <div className="flex flex-col divide-y divide-border-subtle">
                      {g.items.map((e) => (
                        <EventRow key={e.id} event={e} />
                      ))}
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        )}
      </PageBody>

      <Drawer open={!!selectedDay} onClose={() => setSelectedDay(null)} title={selectedDay ? formatFull(selectedDay) : ''}>
        {selectedDay && (
          eventsOn(selectedDay).length === 0 ? (
            <EmptyState title="No events on this day" />
          ) : (
            <div className="flex flex-col divide-y divide-border-subtle">
              {eventsOn(selectedDay).map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          )
        )}
      </Drawer>
    </div>
  )
}

function badgeBg(color) {
  const map = {
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
    neutral: 'bg-surface-subtle text-ink-muted',
  }
  return map[color] || map.info
}

function EventRow({ event }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <span className={classNames('h-2.5 w-2.5 shrink-0 rounded-full', dotColor(TYPE_COLORS[event.type]))} />
        <div>
          <p className="text-sm font-medium text-ink">{event.title}</p>
          {event.meta && <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-faint"><MapPin className="h-3 w-3" />{event.meta}</p>}
        </div>
      </div>
      <Badge color={TYPE_COLORS[event.type]}>{event.type}</Badge>
    </div>
  )
}

function DayAgendaRow({ date, events, isToday, onClick }) {
  return (
    <Card className="flex flex-col gap-2 sm:flex-row sm:gap-4" onClick={onClick} as="div">
      <div className="flex shrink-0 flex-row items-center gap-2 sm:w-32 sm:flex-col sm:items-start">
        <span className={classNames('text-sm font-semibold', isToday ? 'text-brand-600' : 'text-ink')}>{WEEKDAYS[date.getDay()]}</span>
        <span className="text-xs text-ink-faint">{formatShort(date)}</span>
      </div>
      <div className="min-w-0 flex-1">
        {events.length === 0 ? (
          <p className="text-sm text-ink-faint">No events</p>
        ) : (
          <div className="flex flex-col gap-2">
            {events.map((e) => (
              <div key={e.id} className="flex items-center gap-2 text-sm">
                <span className={classNames('h-2 w-2 shrink-0 rounded-full', dotColor(TYPE_COLORS[e.type]))} />
                <span className="font-medium text-ink">{e.title}</span>
                <Badge color={TYPE_COLORS[e.type]} className="ml-auto shrink-0">{e.type}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

function dotColor(color) {
  const map = { info: 'bg-sky-500', warning: 'bg-amber-500', brand: 'bg-brand-500', success: 'bg-emerald-500', danger: 'bg-red-500', neutral: 'bg-ink-faint' }
  return map[color] || map.info
}
