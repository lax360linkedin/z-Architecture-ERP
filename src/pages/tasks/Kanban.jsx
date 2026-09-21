import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Calendar } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Input'
import { Drawer } from '../../components/ui/Drawer'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { PageLoader } from '../../components/layout/PageLoader'
import { taskApi } from '../../api/collaborationApi'
import { taskPriorities } from '../../data/tasks'
import { getProjectName, projects } from '../../data/projects'
import { getEmployeeName, employees } from '../../data/employees'
import { formatDate, classNames } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'

const priorityColor = { low: 'neutral', medium: 'warning', high: 'danger', urgent: 'danger' }
const columnColors = {
  'To Do': 'border-t-sky-400',
  'In Progress': 'border-t-amber-400',
  'In Review': 'border-t-violet-400',
  Done: 'border-t-emerald-400',
}

export default function Kanban() {
  const { user } = useAuth()
  const { can } = usePermissions()
  const allowCreate = can('tasks', 'create')
  const allowEdit = can('tasks', 'edit')
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [dragId, setDragId] = useState(null)
  const [drawer, setDrawer] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  async function load() {
    setLoading(true)
    const data = await taskApi.myTasks.all()
    setTasks(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function moveTo(id, status) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    await taskApi.moveTask(id, status)
    toast.success(`Moved to ${status}`)
  }

  function openCreate() {
    reset({ title: '', project: '', priority: 'medium', status: 'To Do', dueDate: '', assignee: user?.id || 'EMP-002' })
    setDrawer(true)
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      await taskApi.myTasks.create({ ...values, project: values.project || null })
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

  if (loading) return <PageLoader />

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Kanban"
        subtitle={allowEdit ? `${tasks.length} tasks · drag cards between columns to update status` : `${tasks.length} tasks`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Task</Button> : null}
      />
      <PageBody className="flex-1 overflow-x-auto">
        <div className="flex h-full gap-4" style={{ minWidth: `${taskApi.taskStatuses.length * 280}px` }}>
          {taskApi.taskStatuses.map((status) => {
            const items = tasks.filter((t) => t.status === status)
            return (
              <div
                key={status}
                onDragOver={allowEdit ? (e) => e.preventDefault() : undefined}
                onDrop={allowEdit ? () => dragId && moveTo(dragId, status) : undefined}
                className="flex w-[270px] shrink-0 flex-col rounded-xl bg-surface-subtle"
              >
                <div className={classNames('flex items-center justify-between rounded-t-xl border-t-[3px] bg-surface-raised px-3 py-2.5', columnColors[status])}>
                  <span className="text-sm font-semibold text-ink">{status}</span>
                  <Badge>{items.length}</Badge>
                </div>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
                  {items.map((t) => (
                    <div
                      key={t.id}
                      draggable={allowEdit}
                      onDragStart={allowEdit ? () => setDragId(t.id) : undefined}
                      className={classNames('space-y-2 rounded-lg border border-border bg-surface-raised p-3 shadow-soft', allowEdit && 'cursor-grab active:cursor-grabbing')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">{t.title}</p>
                        <Badge color={priorityColor[t.priority] || 'neutral'}>{t.priority}</Badge>
                      </div>
                      {t.project && <p className="text-xs text-ink-muted line-clamp-2">{getProjectName(t.project)}</p>}
                      <div className="flex items-center justify-between pt-1">
                        <span className="flex items-center gap-1 text-xs text-ink-faint"><Calendar className="h-3 w-3" />{formatDate(t.dueDate)}</span>
                        <Avatar name={getEmployeeName(t.assignee)} size="xs" />
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <p className="px-2 py-6 text-center text-xs text-ink-faint">Drop tasks here</p>}
                </div>
              </div>
            )
          })}
        </div>
      </PageBody>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="New Task" footer={<><Button variant="secondary" onClick={() => setDrawer(false)}>Cancel</Button><Button loading={saving} onClick={handleSubmit(onSubmit)}>Create Task</Button></>}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Title" required error={errors.title?.message}>
            <Input {...register('title', { required: 'Title is required' })} />
          </Field>
          <Field label="Project (optional)">
            <Select {...register('project')}>
              <option value="">No project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority">
              <Select {...register('priority')}>
                {taskPriorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select {...register('status')}>
                {taskApi.taskStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due Date"><Input type="date" {...register('dueDate')} /></Field>
            <Field label="Assignee">
              <Select {...register('assignee')}>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
