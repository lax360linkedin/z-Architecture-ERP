import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select, Field, Input } from '../../components/ui/Input'
import { Drawer } from '../../components/ui/Drawer'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { taskApi } from '../../api/taskApi'
import { projects, getProjectName } from '../../data/projects'
import { TASK_STATUSES, TASK_PRIORITIES, TASK_TYPES } from '../../data/tasks'
import { getEmployeeName, employees } from '../../data/employees'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/format'

export default function ProjectPlanning() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [groupBy, setGroupBy] = useState('project')
  const [drawer, setDrawer] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  async function load() {
    setLoading(true)
    const data = await taskApi.allForUser(user)
    setTasks(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const activeProjects = useMemo(() => projects.filter((p) => p.status === 'in-progress'), [])

  const today = new Date()
  const ganttRows = useMemo(() => activeProjects.map((p) => {
    const start = new Date(p.startDate)
    const end = new Date(p.deadline)
    const total = end - start
    const elapsed = Math.min(Math.max(today - start, 0), total)
    const pct = total > 0 ? (elapsed / total) * 100 : 0
    return { ...p, ganttPct: Math.min(100, Math.max(0, pct)) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [activeProjects])

  const tasksByProject = useMemo(() => {
    const map = {}
    tasks.forEach((t) => {
      if (!t.project) return
      map[t.project] = map[t.project] || []
      map[t.project].push(t)
    })
    return map
  }, [tasks])

  async function onSubmit(values) {
    setSaving(true)
    try {
      await taskApi.create({
        project: values.project,
        title: values.title,
        type: values.type || 'General Task',
        assignedTo: values.assignedTo,
        priority: values.priority,
        status: values.status,
        startDate: values.startDate,
        dueDate: values.dueDate,
      }, user)
      toast.success('Task created')
      setDrawer(false)
      reset()
      load()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Project Planning"
        subtitle={`${activeProjects.length} active projects in planning`}
        actions={<Button icon={Plus} onClick={() => { reset({ project: activeProjects[0]?.id, type: TASK_TYPES[0], priority: 'Medium', status: 'Not Started', assignedTo: employees[0]?.id }); setDrawer(true) }}>Create Task</Button>}
      />
      <PageBody className="flex flex-col gap-5">
        <Card padded={false}>
          <CardHeader title="Project Timeline" subtitle="Elapsed schedule vs deadline" className="px-5 pt-5" />
          <div className="flex flex-col gap-4 p-5 pt-0">
            {ganttRows.length === 0 ? (
              <EmptyState title="No active projects" />
            ) : ganttRows.map((p) => (
              <div key={p.id} className="flex flex-col gap-1.5 cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{p.name}</span>
                  <span className="text-xs text-ink-faint">{formatDate(p.startDate)} – {formatDate(p.deadline)}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-surface-subtle">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${p.ganttPct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padded={false}>
          <CardHeader
            title="Work Breakdown"
            subtitle="Tasks grouped by project"
            className="px-5 pt-5"
            action={
              <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="w-auto min-w-[140px]">
                <option value="project">Group by Project</option>
                <option value="status">Group by Status</option>
              </Select>
            }
          />
          <div className="flex flex-col divide-y divide-border-subtle">
            {loading ? (
              <div className="p-5"><EmptyState title="Loading tasks…" /></div>
            ) : tasks.length === 0 ? (
              <div className="p-5"><EmptyState title="No tasks planned" /></div>
            ) : groupBy === 'project' ? (
              Object.entries(tasksByProject).map(([projectId, list]) => (
                <div key={projectId} className="p-5">
                  <p className="mb-2 text-sm font-semibold text-ink">{getProjectName(projectId)}</p>
                  <div className="flex flex-col gap-2">
                    {list.map((t) => (
                      <div key={t.id} className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2 text-sm cursor-pointer hover:bg-surface-subtle" onClick={() => navigate(`/tasks/${t.id}`)}>
                        <div>
                          <p className="text-ink">{t.title}</p>
                          <p className="text-xs text-ink-faint">{t.type} · {getEmployeeName(t.assignedTo)} · Due {formatDate(t.dueDate)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{t.priority}</Badge>
                          <StatusBadge status={t.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              TASK_STATUSES.map((status) => {
                const list = tasks.filter((t) => t.status === status)
                if (list.length === 0) return null
                return (
                  <div key={status} className="p-5">
                    <p className="mb-2 text-sm font-semibold text-ink">{status} ({list.length})</p>
                    <div className="flex flex-col gap-2">
                      {list.map((t) => (
                        <div key={t.id} className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2 text-sm cursor-pointer hover:bg-surface-subtle" onClick={() => navigate(`/tasks/${t.id}`)}>
                          <div>
                            <p className="text-ink">{t.title}</p>
                            <p className="text-xs text-ink-faint">{t.project ? getProjectName(t.project) : 'General'} · {getEmployeeName(t.assignedTo)} · Due {formatDate(t.dueDate)}</p>
                          </div>
                          <Badge>{t.priority}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </PageBody>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Create Task" footer={<><Button variant="secondary" onClick={() => setDrawer(false)}>Cancel</Button><Button loading={saving} onClick={handleSubmit(onSubmit)}>Create</Button></>}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Project" required error={errors.project?.message}>
            <Select {...register('project', { required: 'Required' })}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Task Title" required error={errors.title?.message}>
            <Input {...register('title', { required: 'Task title is required' })} />
          </Field>
          <Field label="Type">
            <Select {...register('type')}>
              {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Assignee">
              <Select {...register('assignedTo')}>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
            <Field label="Priority">
              <Select {...register('priority')}>
                {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date"><Input type="date" {...register('startDate')} /></Field>
            <Field label="Due Date"><Input type="date" {...register('dueDate')} /></Field>
          </div>
          <Field label="Status">
            <Select {...register('status')}>
              {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        </form>
      </Drawer>
    </div>
  )
}
