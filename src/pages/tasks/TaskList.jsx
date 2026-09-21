import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  Plus, Pencil, Trash2, MoreHorizontal, Eye, UserCog, ShieldCheck, CheckSquare,
  Copy, Check, RefreshCw, Link2,
} from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input, Textarea, Checkbox } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useDataTable } from '../../hooks/useDataTable'
import { taskApi } from '../../api/taskApi'
import { tasks, milestones, TASK_TYPES, TASK_STATUSES, TASK_PRIORITIES } from '../../data/tasks'
import { employees, getEmployeeName } from '../../data/employees'
import { projects } from '../../data/projects'
import { DEPARTMENTS } from '../../utils/constants'
import { formatDate } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'

const priorityColor = { Low: 'neutral', Medium: 'info', High: 'warning', Critical: 'danger' }

function taskProgress(t) {
  if (t.checklist?.length) {
    const done = t.checklist.filter((c) => c.done).length
    return Math.round((done / t.checklist.length) * 100)
  }
  if (t.estimatedHours > 0) {
    return Math.min(100, Math.round(((t.actualHours || 0) / t.estimatedHours) * 100))
  }
  return 0
}

const emptyCreateValues = {
  title: '', description: '', type: TASK_TYPES[0], project: '', milestone: '', parentTask: '',
  assignedTo: '', assignedDepartment: '', reviewer: '', startDate: '', dueDate: '',
  estimatedHours: '', priority: 'Medium', status: 'Not Started', tags: '',
}

export default function TaskList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { can } = usePermissions()
  const [searchParams, setSearchParams] = useSearchParams()

  const allowCreate = can('tasks', 'create')
  const allowEdit = can('tasks', 'edit')
  const allowDelete = can('tasks', 'delete')
  const allowAssign = can('tasks', 'assign') || can('tasks', 'reassign')
  const allowApprove = can('tasks', 'approve')
  const allowComplete = can('tasks', 'complete')

  const scopedList = useCallback((params) => taskApi.listForUser(user, params), [user])
  const table = useDataTable(scopedList, {
    pageSize: 10,
    initialFilters: {
      project: 'all', assignedTo: 'all', assignedDepartment: 'all', status: 'all',
      priority: 'all', type: 'all', milestone: 'all', overdue: 'all',
    },
  })

  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [reassignState, setReassignState] = useState({ open: false, task: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues: emptyCreateValues })
  const { register: registerReassign, handleSubmit: handleReassignSubmit, reset: resetReassign } = useForm()

  const watchProject = watch('project')
  const milestoneOptions = watchProject ? milestones.filter((m) => m.project === watchProject) : []
  const parentTaskOptions = watchProject
    ? tasks.filter((t) => t.project === watchProject && t.id !== drawer.record?.id)
    : []

  function openCreate() {
    reset(emptyCreateValues)
    setDrawer({ open: true, mode: 'create', record: null })
  }

  function openEdit(record) {
    reset({
      ...record,
      project: record.project || '',
      milestone: record.milestone || '',
      parentTask: record.parentTask || '',
      assignedTo: record.assignedTo || '',
      assignedDepartment: record.assignedDepartment || '',
      reviewer: record.reviewer || '',
      estimatedHours: record.estimatedHours ?? '',
      tags: (record.tags || []).join(', '),
    })
    setDrawer({ open: true, mode: 'edit', record })
  }

  // Auto-open the create drawer when TaskDashboard links here with ?new=1.
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      if (allowCreate) openCreate()
      const next = new URLSearchParams(searchParams)
      next.delete('new')
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = {
        title: values.title,
        description: values.description || '',
        type: values.type,
        project: values.project || null,
        milestone: values.milestone || null,
        parentTask: values.parentTask || null,
        assignedTo: values.assignedTo || null,
        assignedDepartment: values.assignedDepartment || null,
        reviewer: values.reviewer || null,
        startDate: values.startDate || null,
        dueDate: values.dueDate || null,
        estimatedHours: Number(values.estimatedHours) || 0,
        priority: values.priority || 'Medium',
        status: values.status || 'Not Started',
        tags: values.tags ? values.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
      }
      if (drawer.mode === 'create') {
        await taskApi.create(payload, user)
        toast.success('Task created successfully')
      } else {
        await taskApi.update(drawer.record.id, payload, user)
        toast.success('Task updated successfully')
      }
      setDrawer({ open: false, mode: 'create', record: null })
      table.refresh()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await taskApi.remove(confirm.record.id, user)
      toast.success('Task deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleChangeStatus(t, status) {
    if (t.status === status) return
    await taskApi.changeStatus(t.id, status, user)
    toast.success(`"${t.title}" moved to ${status}`)
    table.refresh()
  }

  async function handleApprove(t) {
    await taskApi.approve(t.id, true, user)
    toast.success(`"${t.title}" approved`)
    table.refresh()
  }

  async function handleMarkComplete(t) {
    await taskApi.changeStatus(t.id, 'Completed', user)
    toast.success(`"${t.title}" marked complete`)
    table.refresh()
  }

  async function handleDuplicate(t) {
    const { id: _id, activity: _activity, comments: _comments, attachments: _attachments, createdDate: _createdDate, ...rest } = t
    await taskApi.create({ ...rest, title: `${t.title} (Copy)` }, user)
    toast.success('Task duplicated')
    table.refresh()
  }

  function openReassign(t) {
    resetReassign({ assignedTo: t.assignedTo || '' })
    setReassignState({ open: true, task: t })
  }

  async function onReassignSubmit(values) {
    setSaving(true)
    try {
      await taskApi.reassign(reassignState.task.id, values.assignedTo, user)
      toast.success('Task reassigned')
      setReassignState({ open: false, task: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'id', header: 'Task ID', sortable: true, render: (t) => <span className="font-medium text-ink">{t.id}</span> },
    { key: 'title', header: 'Task Name', sortable: true, render: (t) => <span className="line-clamp-1 max-w-[220px] font-medium text-ink">{t.title}</span> },
    { key: 'project', header: 'Project', render: (t) => (t.project ? projects.find((p) => p.id === t.project)?.name || t.project : '—') },
    { key: 'type', header: 'Task Type', render: (t) => <Badge>{t.type}</Badge> },
    {
      key: 'assignedTo', header: 'Assigned To', render: (t) => (
        <span className="flex items-center gap-2">
          <Avatar name={getEmployeeName(t.assignedTo)} size="xs" />
          {t.assignedTo ? getEmployeeName(t.assignedTo) : 'Unassigned'}
        </span>
      ),
    },
    { key: 'createdBy', header: 'Created By', render: (t) => getEmployeeName(t.createdBy) },
    { key: 'priority', header: 'Priority', render: (t) => <Badge color={priorityColor[t.priority] || 'neutral'}>{t.priority}</Badge> },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'startDate', header: 'Start Date', sortable: true, render: (t) => formatDate(t.startDate) },
    { key: 'dueDate', header: 'Due Date', sortable: true, render: (t) => formatDate(t.dueDate) },
    { key: 'progress', header: 'Progress', render: (t) => <ProgressBar value={taskProgress(t)} color="auto" className="w-28" /> },
    {
      key: 'dependencies', header: 'Dependencies', render: (t) => {
        if (!t.dependencies?.length) return <span className="text-xs text-ink-faint">—</span>
        const ready = taskApi.isReady(t)
        return (
          <Badge color={ready ? 'neutral' : 'danger'}>
            <Link2 className="h-3 w-3" />{t.dependencies.length}
          </Badge>
        )
      },
    },
    {
      key: 'approvalStatus', header: 'Approval', render: (t) => t.approvalStatus
        ? <Badge className="capitalize" color={t.approvalStatus === 'approved' ? 'success' : t.approvalStatus === 'rejected' ? 'danger' : 'warning'}>{t.approvalStatus}</Badge>
        : <span className="text-xs text-ink-faint">—</span>,
    },
    { key: 'createdDate', header: 'Created Date', sortable: true, render: (t) => formatDate(t.createdDate) },
    {
      key: '__actions', header: '', className: 'text-right', render: (t) => {
        const rowAllowApprove = allowApprove && t.status === 'Review'
        const rowAllowComplete = allowComplete && t.status !== 'Completed'
        return (
          <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
            <Dropdown align="right" width="w-56" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
              <DropdownItem icon={Eye} onClick={() => navigate(`/tasks/${t.id}`)}>View</DropdownItem>
              {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(t)}>Edit</DropdownItem>}
              {allowAssign && <DropdownItem icon={UserCog} onClick={() => openReassign(t)}>Reassign</DropdownItem>}
              {rowAllowComplete && <DropdownItem icon={CheckSquare} onClick={() => handleMarkComplete(t)}>Mark Complete</DropdownItem>}
              {rowAllowApprove && <DropdownItem icon={ShieldCheck} onClick={() => handleApprove(t)}>Approve</DropdownItem>}
              {allowCreate && <DropdownItem icon={Copy} onClick={() => handleDuplicate(t)}>Duplicate</DropdownItem>}
              {allowEdit && <DropdownSeparator />}
              {allowEdit && TASK_STATUSES.map((s) => (
                <DropdownItem key={s} icon={t.status === s ? Check : RefreshCw} onClick={() => handleChangeStatus(t, s)}>
                  Move to {s}
                </DropdownItem>
              ))}
              {allowDelete && <DropdownSeparator />}
              {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: t })}>Delete</DropdownItem>}
            </Dropdown>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="All Tasks"
        subtitle={`${table.total} tasks across the organization`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Task</Button> : null}
      />
      <PageBody>
        <Card padded={false}>
          <DataTable
            columns={columns}
            data={table.items}
            loading={table.loading}
            error={table.error}
            onRetry={table.refresh}
            selectable={allowDelete}
            selected={selected}
            onSelectedChange={setSelected}
            sort={table.sort}
            onSortChange={table.toggleSort}
            onRowClick={(row) => navigate(`/tasks/${row.id}`)}
            page={table.page}
            pageSize={table.pageSize}
            total={table.total}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
            emptyState={{ title: 'No tasks found', description: 'Create your first task to get started.', action: allowCreate ? { label: 'New Task', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => taskApi.remove(id, user))); toast.success(`${ids.length} task(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search tasks…" className="w-full max-w-xs" />
                <Select value={table.filters.project} onChange={(e) => table.setFilters((p) => ({ ...p, project: e.target.value }))} className="w-auto min-w-[150px]">
                  <option value="all">All Projects</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
                <Select value={table.filters.assignedTo} onChange={(e) => table.setFilters((p) => ({ ...p, assignedTo: e.target.value }))} className="w-auto min-w-[150px]">
                  <option value="all">All Employees</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </Select>
                <Select value={table.filters.assignedDepartment} onChange={(e) => table.setFilters((p) => ({ ...p, assignedDepartment: e.target.value }))} className="w-auto min-w-[150px]">
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[140px]">
                  <option value="all">All Status</option>
                  {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Select value={table.filters.priority} onChange={(e) => table.setFilters((p) => ({ ...p, priority: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Priority</option>
                  {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
                <Select value={table.filters.type} onChange={(e) => table.setFilters((p) => ({ ...p, type: e.target.value }))} className="w-auto min-w-[150px]">
                  <option value="all">All Types</option>
                  {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
                <Select value={table.filters.milestone} onChange={(e) => table.setFilters((p) => ({ ...p, milestone: e.target.value }))} className="w-auto min-w-[150px]">
                  <option value="all">All Milestones</option>
                  {milestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Select>
                <Checkbox
                  label="Overdue only"
                  checked={table.filters.overdue === true}
                  onChange={(e) => table.setFilters((p) => ({ ...p, overdue: e.target.checked ? true : 'all' }))}
                />
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Task' : 'Edit Task'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Create Task' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Title" required error={errors.title?.message}>
            <Input {...register('title', { required: 'Title is required' })} />
          </Field>
          <Field label="Description">
            <Textarea {...register('description')} placeholder="Task description…" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select {...register('type')}>
                {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Project">
              <Select {...register('project')}>
                <option value="">None</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Milestone" hint={!watchProject ? 'Select a project first' : undefined}>
              <Select {...register('milestone')} disabled={!watchProject}>
                <option value="">None</option>
                {milestoneOptions.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
            </Field>
            <Field label="Parent Task" hint={!watchProject ? 'Select a project first' : undefined}>
              <Select {...register('parentTask')} disabled={!watchProject}>
                <option value="">None</option>
                {parentTaskOptions.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Assigned Employee">
              <Select {...register('assignedTo')}>
                <option value="">Unassigned</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
            <Field label="Assigned Department">
              <Select {...register('assignedDepartment')}>
                <option value="">None</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Reviewer">
            <Select {...register('reviewer')}>
              <option value="">None</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date"><Input type="date" {...register('startDate')} /></Field>
            <Field label="Due Date"><Input type="date" {...register('dueDate')} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estimated Hours"><Input type="number" step="0.5" min="0" {...register('estimatedHours')} /></Field>
            <Field label="Priority">
              <Select {...register('priority')}>
                {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Status">
            <Select {...register('status')}>
              {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Tags" hint="Comma-separated">
            <Input {...register('tags')} placeholder="e.g. design, urgent" />
          </Field>
        </form>
      </Drawer>

      <Modal
        open={reassignState.open}
        onClose={() => setReassignState({ open: false, task: null })}
        title="Reassign Task"
        description={reassignState.task ? `"${reassignState.task.title}"` : ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReassignState({ open: false, task: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleReassignSubmit(onReassignSubmit)}>Reassign</Button>
          </>
        }
      >
        <form onSubmit={handleReassignSubmit(onReassignSubmit)}>
          <Field label="Assign to" required>
            <Select {...registerReassign('assignedTo', { required: true })}>
              <option value="">Select employee</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.designation}</option>)}
            </Select>
          </Field>
        </form>
      </Modal>

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
