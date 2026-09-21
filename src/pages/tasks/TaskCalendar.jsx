import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CalendarClock, FolderKanban } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Pills } from '../../components/ui/Tabs'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Input'
import { Drawer } from '../../components/ui/Drawer'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { Avatar } from '../../components/ui/Avatar'
import { taskApi } from '../../api/taskApi'
import { useAuth } from '../../context/AuthContext'
import { employees, getEmployeeName } from '../../data/employees'
import { projects, getProjectName } from '../../data/projects'
import { classNames } from '../../utils/format'

const TODAY = new Date('2024-09-19')

const PRIORITY_COLORS = { Low: 'neutral', Medium: 'brand', High: 'warning', Critical: 'danger' }

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

export default function TaskCalendar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [view, setView] = useState('month')
  const [cursor, setCursor] = useState(TODAY)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [projectFilter, setProjectFilter] = useState('all')
  const [employeeFilter, setEmployeeFilter] = useState('all')

  useEffect(() => {
    taskApi.allForUser(user).then((all) => {
      setTasks(all)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const filteredTasks = useMemo(() => tasks
    .filter((t) => !!t.dueDate)
    .filter((t) => projectFilter === 'all' || t.project === projectFilter)
    .filter((t) => employeeFilter === 'all' || t.assignedTo === employeeFilter), [tasks, projectFilter, employeeFilter])

  const tasksByDate = useMemo(() => {
    const map = {}
    filteredTasks.forEach((t) => {
      const key = t.dueDate
      if (!map[key]) map[key] = []
      map[key].push(t)
    })
    return map
  }, [filteredTasks])

  function tasksOn(d) {
    return tasksByDate[dateKey(d)] || []
  }

  function shift(delta) {
    if (view === 'month') setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1))
    else if (view === 'week') setCursor((c) => addDays(c, delta * 7))
    else setCursor((c) => addDays(c, delta))
  }

  const monthGrid = useMemo(() => getMonthGrid(cursor), [cursor])
  const weekDays = useMemo(() => getWeekDays(cursor), [cursor])

  const headerLabel = (() => {
    if (view === 'month') return `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`
    if (view === 'week') return `${formatShort(weekDays[0])} – ${formatShort(weekDays[6])}, ${weekDays[0].getFullYear()}`
    return formatFull(cursor)
  })()

  return (
    <div>
      <PageHeader
        title="Task Calendar"
        subtitle="Every task plotted by its due date, colour-coded by priority"
        actions={<Pills value={view} onChange={setView} options={[{ value: 'month', label: 'Month' }, { value: 'week', label: 'Week' }, { value: 'day', label: 'Day' }]} />}
      />
      <PageBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="secondary" onClick={() => shift(-1)} aria-label="Previous">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" onClick={() => shift(1)} aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" icon={CalendarClock} onClick={() => setCursor(TODAY)}>
              Today
            </Button>
            <h2 className="ml-1 text-base font-semibold text-ink">{headerLabel}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="w-auto min-w-[170px]">
              <option value="all">All Projects</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className="w-auto min-w-[170px]">
              <option value="all">All Employees</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
            <span key={priority} className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span className={classNames('h-2 w-2 rounded-full', dotColor(color))} />
              {priority}
            </span>
          ))}
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
                const dayTasks = tasksOn(d)
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
                      {dayTasks.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${t.id}`) }}
                          className={classNames('truncate rounded px-1.5 py-0.5 text-[10px] font-medium hover:opacity-80', badgeBg(PRIORITY_COLORS[t.priority]))}
                        >
                          {t.title}
                        </span>
                      ))}
                      {dayTasks.length > 3 && <span className="px-1.5 text-[10px] font-medium text-ink-faint">+{dayTasks.length - 3} more</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        ) : view === 'week' ? (
          <div className="flex flex-col gap-3">
            {weekDays.map((d) => (
              <DayAgendaRow key={dateKey(d)} date={d} tasks={tasksOn(d)} isToday={isSameDate(d, TODAY)} onClick={() => setSelectedDay(d)} onTaskClick={(id) => navigate(`/tasks/${id}`)} />
            ))}
          </div>
        ) : (
          <Card>
            {tasksOn(cursor).length === 0 ? (
              <EmptyState title="No tasks due this day" description="Nothing scheduled — enjoy the breathing room." />
            ) : (
              <div className="flex flex-col divide-y divide-border-subtle">
                {tasksOn(cursor).map((t) => (
                  <TaskRow key={t.id} task={t} onClick={() => navigate(`/tasks/${t.id}`)} />
                ))}
              </div>
            )}
          </Card>
        )}
      </PageBody>

      <Drawer open={!!selectedDay} onClose={() => setSelectedDay(null)} title={selectedDay ? formatFull(selectedDay) : ''}>
        {selectedDay && (
          tasksOn(selectedDay).length === 0 ? (
            <EmptyState title="No tasks due this day" />
          ) : (
            <div className="flex flex-col divide-y divide-border-subtle">
              {tasksOn(selectedDay).map((t) => (
                <TaskRow key={t.id} task={t} onClick={() => navigate(`/tasks/${t.id}`)} />
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
    neutral: 'bg-surface-subtle text-ink-muted',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
  }
  return map[color] || map.neutral
}

function dotColor(color) {
  const map = { neutral: 'bg-ink-faint', info: 'bg-sky-500', warning: 'bg-amber-500', brand: 'bg-brand-500', success: 'bg-emerald-500', danger: 'bg-red-500' }
  return map[color] || map.neutral
}

function TaskRow({ task, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between gap-3 py-3 text-left first:pt-0">
      <div className="flex items-center gap-3">
        <span className={classNames('h-2.5 w-2.5 shrink-0 rounded-full', dotColor(PRIORITY_COLORS[task.priority]))} />
        <div className="flex items-center gap-2.5">
          <Avatar name={getEmployeeName(task.assignedTo)} size="sm" />
          <div>
            <p className="text-sm font-medium text-ink">{task.title}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-faint">
              {task.project ? <><FolderKanban className="h-3 w-3" />{getProjectName(task.project)}</> : 'General'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={task.status} />
        <Badge color={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
      </div>
    </button>
  )
}

function DayAgendaRow({ date, tasks, isToday, onClick, onTaskClick }) {
  return (
    <Card className="flex flex-col gap-2 sm:flex-row sm:gap-4" onClick={onClick} as="div">
      <div className="flex shrink-0 flex-row items-center gap-2 sm:w-32 sm:flex-col sm:items-start">
        <span className={classNames('text-sm font-semibold', isToday ? 'text-brand-600' : 'text-ink')}>{WEEKDAYS[date.getDay()]}</span>
        <span className="text-xs text-ink-faint">{formatShort(date)}</span>
      </div>
      <div className="min-w-0 flex-1">
        {tasks.length === 0 ? (
          <p className="text-sm text-ink-faint">No tasks due</p>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-sm" onClick={(e) => { e.stopPropagation(); onTaskClick(t.id) }}>
                <span className={classNames('h-2 w-2 shrink-0 rounded-full', dotColor(PRIORITY_COLORS[t.priority]))} />
                <span className="font-medium text-ink hover:underline">{t.title}</span>
                <Badge color={PRIORITY_COLORS[t.priority]} className="ml-auto shrink-0">{t.priority}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
