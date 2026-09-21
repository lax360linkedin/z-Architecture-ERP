import { useMemo, useState } from 'react'
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
import { taskApi } from '../../api/collaborationApi'
import { projects, getProjectName } from '../../data/projects'
import { wbsTasks, taskPriorities } from '../../data/tasks'
import { getEmployeeName, employees } from '../../data/employees'
import { formatDate } from '../../utils/format'

export default function ProjectPlanning() {
  const navigate = useNavigate()
  const [tasksVersion, setTasksVersion] = useState(0)
  const [groupBy, setGroupBy] = useState('project')
  const [drawer, setDrawer] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const activeProjects = useMemo(() => projects.filter((p) => p.status === 'in-progress'), [])

  const today = new Date()
  const ganttRows = useMemo(() => activeProjects.map((p) => {
    const start = new Date(p.startDate)
    const end = new Date(p.deadline)
    const total = end - start
    const elapsed = Math.min(Math.max(today - start, 0), total)
    const pct = total > 0 ? (elapsed / total) * 100 : 0
    return { ...p, ganttPct: Math.min(100, Math.max(0, pct)) }
  }), [activeProjects])

  const tasksByProject = useMemo(() => {
    const map = {}
    wbsTasks.forEach((t) => {
      map[t.project] = map[t.project] || []
      map[t.project].push(t)
    })
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksVersion])

  async function onSubmit(values) {
    setSaving(true)
    try {
      await taskApi.teamTasks.create({
        project: values.project,
        name: values.name,
        phase: values.phase || 'Planning',
        assignee: values.assignee,
        priority: values.priority,
        status: values.status,
        startDate: values.startDate,
        dueDate: values.dueDate,
        dependsOn: null,
      })
      toast.success('Task created')
      setDrawer(false)
      reset()
      setTasksVersion((v) => v + 1)
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
        actions={<Button icon={Plus} onClick={() => { reset({ project: activeProjects[0]?.id, priority: 'medium', status: 'To Do', assignee: 'EMP-004' }); setDrawer(true) }}>Create Task</Button>}
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
            {wbsTasks.length === 0 ? (
              <div className="p-5"><EmptyState title="No tasks planned" /></div>
            ) : groupBy === 'project' ? (
              Object.entries(tasksByProject).map(([projectId, list]) => (
                <div key={projectId} className="p-5">
                  <p className="mb-2 text-sm font-semibold text-ink">{getProjectName(projectId)}</p>
                  <div className="flex flex-col gap-2">
                    {list.map((t) => (
                      <div key={t.id} className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2 text-sm">
                        <div>
                          <p className="text-ink">{t.name}</p>
                          <p className="text-xs text-ink-faint">{t.phase} · {getEmployeeName(t.assignee)} · Due {formatDate(t.dueDate)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={t.priority} />
                          <Badge>{t.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              ['To Do', 'In Progress', 'In Review', 'Done'].map((status) => {
                const list = wbsTasks.filter((t) => t.status === status)
                if (list.length === 0) return null
                return (
                  <div key={status} className="p-5">
                    <p className="mb-2 text-sm font-semibold text-ink">{status} ({list.length})</p>
                    <div className="flex flex-col gap-2">
                      {list.map((t) => (
                        <div key={t.id} className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2 text-sm">
                          <div>
                            <p className="text-ink">{t.name}</p>
                            <p className="text-xs text-ink-faint">{getProjectName(t.project)} · {getEmployeeName(t.assignee)} · Due {formatDate(t.dueDate)}</p>
                          </div>
                          <StatusBadge status={t.priority} />
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
          <Field label="Task Name" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Task name is required' })} />
          </Field>
          <Field label="Phase">
            <Input {...register('phase')} placeholder="e.g. Design, Structure, Finishing" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Assignee">
              <Select {...register('assignee')}>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
            <Field label="Priority">
              <Select {...register('priority')}>
                {taskPriorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date"><Input type="date" {...register('startDate')} /></Field>
            <Field label="Due Date"><Input type="date" {...register('dueDate')} /></Field>
          </div>
          <Field label="Status">
            <Select {...register('status')}>
              {['To Do', 'In Progress', 'In Review', 'Done'].map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        </form>
      </Drawer>
    </div>
  )
}
