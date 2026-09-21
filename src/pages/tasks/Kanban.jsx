import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Calendar, MessageSquare, Paperclip } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Input'
import { Drawer } from '../../components/ui/Drawer'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { PageLoader } from '../../components/layout/PageLoader'
import { taskApi } from '../../api/taskApi'
import { TASK_TYPES, TASK_STATUSES, TASK_PRIORITIES } from '../../data/tasks'
import { getProjectName, projects } from '../../data/projects'
import { getEmployeeName, employees } from '../../data/employees'
import { formatDate, classNames } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'

const priorityColor = { Low: 'neutral', Medium: 'info', High: 'warning', Critical: 'danger' }

// TASK_STATUSES is already ordered lifecycle-first (Not Started -> In
// Progress -> Review -> Approved -> Completed) with the alternate states
// (On Hold, Blocked, Cancelled) trailing, so the array order alone gives us
// the "primary lifecycle left-to-right, alternates after" layout.
const columnAccents = {
  'Not Started': 'border-t-violet-300',
  'In Progress': 'border-t-brand-500',
  Review: 'border-t-amber-400',
  Approved: 'border-t-sky-400',
  Completed: 'border-t-emerald-400',
  'On Hold': 'border-t-zinc-400',
  Blocked: 'border-t-rose-400',
  Cancelled: 'border-t-zinc-300',
}

function taskProgress(t) {
  if (t.checklist?.length) {
    const done = t.checklist.filter((c) => c.done).length
    return Math.round((done / t.checklist.length) * 100)
  }
  if (t.estimatedHours > 0) return Math.min(100, Math.round(((t.actualHours || 0) / t.estimatedHours) * 100))
  return 0
}

export default function Kanban() {
  const navigate = useNavigate()
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
    const data = await taskApi.allForUser(user)
    setTasks(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function moveTo(id, status) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    await taskApi.changeStatus(id, status, user)
    toast.success(`Moved to ${status}`)
  }

  function openCreate() {
    reset({ title: '', type: TASK_TYPES[0], project: '', assignedTo: '', priority: 'Medium', status: 'Not Started', dueDate: '', estimatedHours: '' })
    setDrawer(true)
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      await taskApi.create({
        title: values.title,
        type: values.type,
        project: values.project || null,
        assignedTo: values.assignedTo || null,
        priority: values.priority,
        status: values.status,
        dueDate: values.dueDate || null,
        estimatedHours: Number(values.estimatedHours) || 0,
        createdBy: user?.employeeId,
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

  if (loading) return <PageLoader />

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Kanban"
        subtitle={allowEdit ? `${tasks.length} tasks · drag cards between columns to update status` : `${tasks.length} tasks`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Task</Button> : null}
      />
      <PageBody className="flex-1 overflow-x-auto">
        <div className="flex h-full gap-4" style={{ minWidth: `${TASK_STATUSES.length * 280}px` }}>
          {TASK_STATUSES.map((status) => {
            const items = tasks.filter((t) => t.status === status)
            return (
              <div
                key={status}
                onDragOver={allowEdit ? (e) => e.preventDefault() : undefined}
                onDrop={allowEdit ? () => dragId && moveTo(dragId, status) : undefined}
                className="flex w-[270px] shrink-0 flex-col rounded-xl bg-surface-subtle"
              >
                <div className={classNames('flex items-center justify-between rounded-t-xl border-t-[3px] bg-surface-raised px-3 py-2.5', columnAccents[status])}>
                  <span className="text-sm font-semibold text-ink">{status}</span>
                  <Badge>{items.length}</Badge>
                </div>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
                  {items.map((t) => {
                    const ready = taskApi.isReady(t)
                    return (
                      <div
                        key={t.id}
                        draggable={allowEdit}
                        onDragStart={allowEdit ? () => setDragId(t.id) : undefined}
                        onClick={() => navigate(`/tasks/${t.id}`)}
                        className={classNames('space-y-2 rounded-lg border border-border bg-surface-raised p-3 shadow-soft', allowEdit && 'cursor-grab active:cursor-grabbing')}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 text-sm font-semibold text-ink">{t.title}</p>
                          <Badge color={priorityColor[t.priority] || 'neutral'}>{t.priority}</Badge>
                        </div>
                        {t.project && <p className="line-clamp-1 text-xs text-ink-muted">{getProjectName(t.project)}</p>}
                        {!ready && <Badge color="danger">Blocked by dependency</Badge>}
                        <ProgressBar value={taskProgress(t)} color="auto" />
                        <div className="flex items-center justify-between pt-1">
                          <span className="flex items-center gap-1 text-xs text-ink-faint"><Calendar className="h-3 w-3" />{formatDate(t.dueDate)}</span>
                          <Avatar name={getEmployeeName(t.assignedTo)} size="xs" />
                        </div>
                        {(t.comments?.length > 0 || t.attachments?.length > 0) && (
                          <div className="flex items-center gap-3 border-t border-border-subtle pt-2 text-xs text-ink-faint">
                            {t.comments?.length > 0 && <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{t.comments.length}</span>}
                            {t.attachments?.length > 0 && <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" />{t.attachments.length}</span>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {items.length === 0 && <p className="px-2 py-6 text-center text-xs text-ink-faint">Drop tasks here</p>}
                </div>
              </div>
            )
          })}
        </div>
      </PageBody>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="New Task"
        footer={<><Button variant="secondary" onClick={() => setDrawer(false)}>Cancel</Button><Button loading={saving} onClick={handleSubmit(onSubmit)}>Create Task</Button></>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Title" required error={errors.title?.message}>
            <Input {...register('title', { required: 'Title is required' })} />
          </Field>
          <Field label="Type">
            <Select {...register('type')}>
              {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
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
                {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select {...register('status')}>
                {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due Date"><Input type="date" {...register('dueDate')} /></Field>
            <Field label="Assignee">
              <Select {...register('assignedTo')}>
                <option value="">Unassigned</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Estimated Hours"><Input type="number" step="0.5" min="0" {...register('estimatedHours')} /></Field>
        </form>
      </Drawer>
    </div>
  )
}
