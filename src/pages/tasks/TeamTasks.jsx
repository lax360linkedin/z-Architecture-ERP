import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, MoreHorizontal, RefreshCw, Check, Lock } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { useDataTable } from '../../hooks/useDataTable'
import { taskApi } from '../../api/collaborationApi'
import { taskPriorities } from '../../data/tasks'
import { getProjectName, projects } from '../../data/projects'
import { getEmployeeName, employees } from '../../data/employees'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

const priorityColor = { low: 'neutral', medium: 'warning', high: 'danger', urgent: 'danger' }
const phases = ['Planning', 'Design', 'Structure', 'Construction', 'Facade', 'Finishing', 'Execution']

export default function TeamTasks() {
  const { can } = usePermissions()
  const allowCreate = can('tasks', 'create')
  const allowEdit = can('tasks', 'edit')
  const allowDelete = can('tasks', 'delete')
  const table = useDataTable(taskApi.teamTasks.list, { pageSize: 8, initialFilters: { status: 'all', priority: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ name: '', project: projects[0]?.id || '', phase: phases[0], assignee: 'EMP-011', priority: 'medium', status: 'To Do', startDate: '', dueDate: '', dependsOn: '' })
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
      await taskApi.teamTasks.remove(confirm.record.id)
      toast.success('Task deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(task, status) {
    if (task.status === status) return
    await taskApi.moveTask(task.id, status, true)
    toast.success(`Marked "${task.name}" as ${status}`)
    table.refresh()
  }

  const columns = [
    {
      key: 'name', header: 'Task Name', sortable: true, render: (t) => (
        <div>
          <p className="font-medium text-ink">{t.name}</p>
          {t.dependsOn && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
              <Lock className="h-3 w-3" /> Blocked by {t.dependsOn}
            </span>
          )}
        </div>
      ),
    },
    { key: 'project', header: 'Project', render: (t) => getProjectName(t.project) },
    { key: 'phase', header: 'Phase', render: (t) => <Badge>{t.phase}</Badge> },
    { key: 'assignee', header: 'Assignee', render: (t) => getEmployeeName(t.assignee) },
    { key: 'priority', header: 'Priority', render: (t) => <Badge color={priorityColor[t.priority] || 'neutral'}>{t.priority}</Badge> },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'dueDate', header: 'Due Date', sortable: true, render: (t) => formatDate(t.dueDate) },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (t) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-52" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(t)}>Edit</DropdownItem>}
                {allowEdit && <DropdownSeparator />}
                {allowEdit && taskApi.taskStatuses.map((s) => (
                  <DropdownItem key={s} icon={t.status === s ? Check : RefreshCw} onClick={() => changeStatus(t, s)}>
                    Mark as {s}
                  </DropdownItem>
                ))}
                {allowEdit && allowDelete && <DropdownSeparator />}
                {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: t })}>Delete</DropdownItem>}
              </Dropdown>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Team Tasks"
        subtitle={`${table.total} tasks across the WBS`}
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
            onRowClick={allowEdit ? openEdit : undefined}
            page={table.page}
            pageSize={table.pageSize}
            total={table.total}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
            emptyState={{ title: 'No team tasks found', description: 'Create your first WBS task to get started.', action: allowCreate ? { label: 'New Task', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => taskApi.teamTasks.remove(id))); toast.success(`${ids.length} task(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search team tasks…" className="w-full max-w-xs" />
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Status</option>
                  {taskApi.taskStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Select value={table.filters.priority} onChange={(e) => table.setFilters((p) => ({ ...p, priority: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Priority</option>
                  {taskPriorities.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              </>
            }
          />
        </Card>
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
