import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, MoreHorizontal, RefreshCw, Check, Lock, ChevronDown } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageLoader } from '../../components/layout/PageLoader'
import { taskApi } from '../../api/collaborationApi'
import { taskPriorities } from '../../data/tasks'
import { getProjectName, projects } from '../../data/projects'
import { getEmployeeName, employees } from '../../data/employees'
import { formatDate, classNames } from '../../utils/format'

const priorityColor = { low: 'neutral', medium: 'warning', high: 'danger', urgent: 'danger' }
const phases = ['Planning', 'Design', 'Structure', 'Construction', 'Facade', 'Finishing', 'Execution']

export default function ProjectTasks() {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState([])
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  async function load() {
    setLoading(true)
    const data = await taskApi.teamTasks.all()
    setTasks(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate(projectId) {
    reset({ name: '', project: projectId || projects[0]?.id || '', phase: phases[0], assignee: 'EMP-011', priority: 'medium', status: 'To Do', startDate: '', dueDate: '', dependsOn: '' })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset({ ...record, dependsOn: record.dependsOn || '' })
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, dependsOn: values.dependsOn || null }
      if (drawer.mode === 'create') {
        await taskApi.teamTasks.create(payload)
        toast.success('Task created')
      } else {
        await taskApi.teamTasks.update(drawer.record.id, payload)
        toast.success('Task updated')
      }
      setDrawer({ open: false, mode: 'create', record: null })
      load()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await taskApi.teamTasks.remove(confirm.record.id)
      toast.success('Task deleted')
      setConfirm({ open: false, record: null })
      load()
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(task, status) {
    if (task.status === status) return
    await taskApi.moveTask(task.id, status, true)
    toast.success(`Marked "${task.name}" as ${status}`)
    load()
  }

  const q = query.trim().toLowerCase()
  const filtered = q ? tasks.filter((t) => t.name.toLowerCase().includes(q) || t.phase.toLowerCase().includes(q)) : tasks

  const grouped = projects
    .map((p) => ({ project: p, items: filtered.filter((t) => t.project === p.id) }))
    .filter((g) => g.items.length > 0 || !q)

  function toggle(id) {
    setCollapsed((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <PageHeader
        title="Project Tasks"
        subtitle={`${tasks.length} WBS tasks grouped by project`}
        actions={<Button icon={Plus} onClick={() => openCreate()}>New Task</Button>}
      />
      <PageBody className="flex flex-col gap-4">
        <SearchInput value={query} onChange={setQuery} placeholder="Search tasks by name or phase…" className="max-w-sm" />

        {grouped.length === 0 ? (
          <Card><EmptyState title="No tasks found" description="Create your first project task to get started." action={{ label: 'New Task', icon: Plus, onClick: () => openCreate() }} /></Card>
        ) : (
          grouped.map(({ project, items }) => {
            const isCollapsed = collapsed.includes(project.id)
            return (
              <Card key={project.id} padded={false}>
                <button onClick={() => toggle(project.id)} className="flex w-full items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <ChevronDown className={classNames('h-4 w-4 text-ink-faint transition-transform', isCollapsed && '-rotate-90')} />
                    <p className="text-sm font-semibold text-ink">{project.name}</p>
                    <Badge>{items.length} task{items.length === 1 ? '' : 's'}</Badge>
                  </div>
                  <Button size="sm" variant="secondary" icon={Plus} onClick={(e) => { e.stopPropagation(); openCreate(project.id) }}>
                    Add Task
                  </Button>
                </button>
                {!isCollapsed && (
                  items.length === 0 ? (
                    <div className="px-5 pb-5"><EmptyState title="No tasks for this project yet" /></div>
                  ) : (
                    <div className="overflow-x-auto border-t border-border">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-border text-xs text-ink-muted">
                            <th className="px-5 py-2.5 font-medium">Task</th>
                            <th className="px-5 py-2.5 font-medium">Phase</th>
                            <th className="px-5 py-2.5 font-medium">Assignee</th>
                            <th className="px-5 py-2.5 font-medium">Priority</th>
                            <th className="px-5 py-2.5 font-medium">Status</th>
                            <th className="px-5 py-2.5 font-medium">Due Date</th>
                            <th className="px-5 py-2.5" />
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((t) => (
                            <tr key={t.id} className="cursor-pointer border-b border-border-subtle last:border-0 hover:bg-surface-subtle" onClick={() => openEdit(t)}>
                              <td className="px-5 py-3">
                                <p className="font-medium text-ink">{t.name}</p>
                                {t.dependsOn && (
                                  <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
                                    <Lock className="h-3 w-3" /> Blocked by {t.dependsOn}
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3"><Badge>{t.phase}</Badge></td>
                              <td className="px-5 py-3 text-ink-muted">{getEmployeeName(t.assignee)}</td>
                              <td className="px-5 py-3"><Badge color={priorityColor[t.priority] || 'neutral'}>{t.priority}</Badge></td>
                              <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                              <td className="px-5 py-3 text-ink-muted">{formatDate(t.dueDate)}</td>
                              <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <Dropdown align="right" width="w-52" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-raised hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                                  <DropdownItem icon={Pencil} onClick={() => openEdit(t)}>Edit</DropdownItem>
                                  <DropdownSeparator />
                                  {taskApi.taskStatuses.map((s) => (
                                    <DropdownItem key={s} icon={t.status === s ? Check : RefreshCw} onClick={() => changeStatus(t, s)}>
                                      Mark as {s}
                                    </DropdownItem>
                                  ))}
                                  <DropdownSeparator />
                                  <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: t })}>Delete</DropdownItem>
                                </Dropdown>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </Card>
            )
          })
        )}
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Task' : 'Edit Task'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Create Task' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Task Name" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Task name is required' })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Project">
              <Select {...register('project')}>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <Field label="Phase">
              <Select {...register('phase')}>
                {phases.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
          </div>
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select {...register('status')}>
                {taskApi.taskStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Depends on (optional Task ID)">
              <Input placeholder="e.g. TSK-1001" {...register('dependsOn')} />
            </Field>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this task?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
