import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Calendar, FolderKanban } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import { Tabs } from '../../components/ui/Tabs'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageLoader } from '../../components/layout/PageLoader'
import { taskApi } from '../../api/taskApi'
import { TASK_STATUSES } from '../../data/tasks'
import { getProjectName } from '../../data/projects'
import { formatDate } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'

const priorityColor = { Low: 'neutral', Medium: 'info', High: 'warning', Critical: 'danger' }

export default function MyTasks() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { can } = usePermissions()
  const allowCreate = can('tasks', 'create')
  const allowEdit = can('tasks', 'edit')

  const [loading, setLoading] = useState(true)
  const [myTasks, setMyTasks] = useState([])
  const [section, setSection] = useState('assigned')

  async function load() {
    setLoading(true)
    // allForUser already scopes to what this role can reach; narrowing to
    // assignedTo === me keeps this page strictly "my" work, including for
    // Employee (dataScope "own") where the scoping already matches.
    const all = await taskApi.allForUser(user)
    setMyTasks(all.filter((t) => t.assignedTo === user?.employeeId))
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const sections = useMemo(() => {
    const dueToday = myTasks.filter((t) => taskApi.isDueToday(t))
    const overdue = myTasks.filter((t) => taskApi.isOverdue(t))
    const upcoming = myTasks.filter((t) => taskApi.isDueThisWeek(t) && !taskApi.isOverdue(t))
    const completed = myTasks.filter((t) => t.status === 'Completed')
    const highPriority = myTasks.filter((t) => t.priority === 'High' || t.priority === 'Critical')
    const blocked = myTasks.filter((t) => t.status === 'Blocked' || !taskApi.isReady(t))
    return { assigned: myTasks, dueToday, upcoming, overdue, completed, highPriority, blocked }
  }, [myTasks])

  const tabs = [
    { value: 'assigned', label: 'Assigned to Me', count: sections.assigned.length },
    { value: 'dueToday', label: 'Due Today', count: sections.dueToday.length },
    { value: 'upcoming', label: 'Upcoming', count: sections.upcoming.length },
    { value: 'overdue', label: 'Overdue', count: sections.overdue.length },
    { value: 'completed', label: 'Completed', count: sections.completed.length },
    { value: 'highPriority', label: 'High Priority', count: sections.highPriority.length },
    { value: 'blocked', label: 'Blocked', count: sections.blocked.length },
  ]

  const items = sections[section] || []

  async function quickChangeStatus(t, status) {
    if (t.status === status) return
    await taskApi.changeStatus(t.id, status, user)
    toast.success(`"${t.title}" moved to ${status}`)
    load()
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <PageHeader
        title="My Tasks"
        subtitle={`${myTasks.length} task(s) assigned to you`}
        actions={allowCreate ? <Button icon={Plus} onClick={() => navigate('/tasks/list?new=1')}>New Task</Button> : null}
      />
      <PageBody className="flex flex-col gap-4">
        <Tabs tabs={tabs} value={section} onChange={setSection} />
        {items.length === 0 ? (
          <Card><EmptyState title="No tasks here" description="Nothing in this view right now." /></Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((t) => (
              <Card
                key={t.id}
                className="flex cursor-pointer flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                onClick={() => navigate(`/tasks/${t.id}`)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink">{t.title}</p>
                    <Badge color={priorityColor[t.priority] || 'neutral'}>{t.priority}</Badge>
                    {(t.status === 'Blocked' || !taskApi.isReady(t)) && <Badge color="danger">Blocked by dependency</Badge>}
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-faint">
                    {t.project && <span className="flex items-center gap-1"><FolderKanban className="h-3.5 w-3.5" />{getProjectName(t.project)}</span>}
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(t.dueDate)}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge status={t.status} />
                  {allowEdit && (
                    <Select value={t.status} onChange={(e) => quickChangeStatus(t, e.target.value)} className="w-auto min-w-[140px]">
                      {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageBody>
    </div>
  )
}
