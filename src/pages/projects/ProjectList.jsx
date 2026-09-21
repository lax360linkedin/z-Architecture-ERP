import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, MapPin, Calendar, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input, Textarea } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Pills } from '../../components/ui/Tabs'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { PageLoader } from '../../components/layout/PageLoader'
import { useDataTable } from '../../hooks/useDataTable'
import { projectApi } from '../../api/projectApi'
import { customers } from '../../data/customers'
import { getCustomerName } from '../../data/customers'
import { getEmployeeName, employees } from '../../data/employees'
import { PROJECT_TYPES } from '../../utils/constants'
import { formatCurrency, formatDate, classNames } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'
import { useCallback } from 'react'

const projectStatuses = ['on-hold', 'in-progress', 'completed']
const statusLabels = { 'on-hold': 'On Hold', 'in-progress': 'In Progress', completed: 'Completed' }
const statusAccents = { 'on-hold': 'border-t-amber-400', 'in-progress': 'border-t-sky-400', completed: 'border-t-emerald-400' }

export default function ProjectList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { can } = usePermissions()
  const allowCreate = can('projects', 'create')
  const allowEdit = can('projects', 'edit')
  const allowDelete = can('projects', 'delete')
  const [view, setView] = useState('table')
  const scopedList = useCallback((params) => projectApi.listForUser(user, params), [user])
  const table = useDataTable(scopedList, { pageSize: 8, initialFilters: { status: 'all', type: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)

  const [kanbanLoading, setKanbanLoading] = useState(true)
  const [kanbanProjects, setKanbanProjects] = useState([])
  const [dragId, setDragId] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (view === 'kanban') loadKanban()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  async function loadKanban() {
    setKanbanLoading(true)
    const all = await projectApi.allForUser(user)
    setKanbanProjects(all)
    setKanbanLoading(false)
  }

  function openCreate() {
    reset({ name: '', code: '', client: customers[0]?.id || '', type: 'Residential', manager: 'EMP-004', location: '', startDate: '', deadline: '', budget: '', description: '' })
    setDrawer({ open: true, mode: 'create', record: null })
  }

  function openEdit(record) {
    reset(record)
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, budget: Number(values.budget) || 0, actual: values.actual != null ? Number(values.actual) : 0, progress: values.progress != null ? Number(values.progress) : 0, status: values.status || 'in-progress', stage: values.stage || 'Planning', team: values.team || [] }
      if (drawer.mode === 'create') {
        await projectApi.create(payload)
        toast.success('Project created successfully')
      } else {
        await projectApi.update(drawer.record.id, payload)
        toast.success('Project updated successfully')
      }
      setDrawer({ open: false, mode: 'create', record: null })
      table.refresh()
      if (view === 'kanban') loadKanban()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await projectApi.remove(confirm.record.id)
      toast.success('Project deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
      if (view === 'kanban') loadKanban()
    } finally {
      setSaving(false)
    }
  }

  async function moveTo(id, status) {
    setKanbanProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
    await projectApi.update(id, { status })
    toast.success(`Moved to ${statusLabels[status]}`)
    table.refresh()
  }

  const columns = [
    { key: 'code', header: 'Code', sortable: true, render: (p) => <span className="font-medium text-ink">{p.code}</span> },
    { key: 'name', header: 'Project', sortable: true, render: (p) => <span className="line-clamp-1 max-w-[220px]">{p.name}</span> },
    { key: 'client', header: 'Client', render: (p) => getCustomerName(p.client) },
    { key: 'type', header: 'Type', render: (p) => <Badge>{p.type}</Badge> },
    { key: 'manager', header: 'Manager', render: (p) => getEmployeeName(p.manager) },
    { key: 'budget', header: 'Budget', sortable: true, render: (p) => formatCurrency(p.budget, { compact: true }) },
    { key: 'actual', header: 'Actual', render: (p) => formatCurrency(p.actual, { compact: true }) },
    { key: 'progress', header: 'Progress', render: (p) => <ProgressBar value={p.progress} color="auto" showLabel className="w-28" /> },
    { key: 'deadline', header: 'Deadline', sortable: true, render: (p) => formatDate(p.deadline) },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (p) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-44" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(p)}>Edit</DropdownItem>}
                {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: p })}>Delete</DropdownItem>}
              </Dropdown>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Projects"
        subtitle={view === 'kanban' ? `${kanbanProjects.length} projects` : `${table.total} projects`}
        actions={
          <>
            <Pills value={view} onChange={setView} options={[{ value: 'table', label: 'Table' }, { value: 'card', label: 'Cards' }, { value: 'kanban', label: 'Kanban' }]} />
            {allowCreate && <Button icon={Plus} onClick={openCreate}>New Project</Button>}
          </>
        }
      />

      {view === 'table' && (
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
              onRowClick={(row) => navigate(`/projects/${row.id}`)}
              page={table.page}
              pageSize={table.pageSize}
              total={table.total}
              totalPages={table.totalPages}
              onPageChange={table.setPage}
              emptyState={{ title: 'No projects found', description: 'Create your first project to get started.', action: allowCreate ? { label: 'New Project', icon: Plus, onClick: openCreate } : undefined }}
              bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => projectApi.remove(id))); toast.success(`${ids.length} project(s) deleted`); setSelected([]); table.refresh() } }] : []}
              toolbar={
                <>
                  <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search projects…" className="w-full max-w-xs" />
                  <Select value={table.filters.type} onChange={(e) => table.setFilters((p) => ({ ...p, type: e.target.value }))} className="w-auto min-w-[140px]">
                    <option value="all">All Types</option>
                    {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                  <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[140px]">
                    <option value="all">All Status</option>
                    {projectStatuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                  </Select>
                </>
              }
            />
          </Card>
        </PageBody>
      )}

      {view === 'card' && (
        <PageBody>
          {table.items.length === 0 && !table.loading ? (
            <Card><EmptyState title="No projects found" description="Create your first project to get started." action={allowCreate ? { label: 'New Project', icon: Plus, onClick: openCreate } : undefined} /></Card>
          ) : table.loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {table.items.map((p) => (
                <Card key={p.id} className="flex cursor-pointer flex-col gap-3" onClick={() => navigate(`/projects/${p.id}`)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-ink">{p.name}</p>
                      <p className="text-xs text-ink-faint">{p.code} · {getCustomerName(p.client)}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-muted">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.location}</span>
                  </div>
                  <ProgressBar value={p.progress} color="auto" showLabel />
                  <div className="grid grid-cols-2 gap-2 border-t border-border-subtle pt-3 text-xs">
                    <div><p className="text-ink-faint">Budget</p><p className="font-semibold text-ink">{formatCurrency(p.budget, { compact: true })}</p></div>
                    <div><p className="text-ink-faint">Actual</p><p className="font-semibold text-ink">{formatCurrency(p.actual, { compact: true })}</p></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-faint">
                    <Badge>{p.type}</Badge>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(p.deadline)}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </PageBody>
      )}

      {view === 'kanban' && (
        <PageBody className="flex-1 overflow-x-auto">
          {kanbanLoading ? (
            <PageLoader />
          ) : (
            <div className="flex h-full gap-4" style={{ minWidth: `${projectStatuses.length * 300}px` }}>
              {projectStatuses.map((status) => {
                const items = kanbanProjects.filter((p) => p.status === status)
                return (
                  <div
                    key={status}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => dragId && moveTo(dragId, status)}
                    className="flex w-[290px] shrink-0 flex-col rounded-xl bg-surface-subtle"
                  >
                    <div className={classNames('flex items-center justify-between rounded-t-xl border-t-[3px] bg-surface-raised px-3 py-2.5', statusAccents[status])}>
                      <span className="text-sm font-semibold text-ink">{statusLabels[status]}</span>
                      <Badge>{items.length}</Badge>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 py-3">
                      {items.map((p) => (
                        <div
                          key={p.id}
                          draggable
                          onDragStart={() => setDragId(p.id)}
                          onClick={() => navigate(`/projects/${p.id}`)}
                          className="cursor-grab space-y-2 rounded-lg border border-border bg-surface-raised p-3 shadow-soft active:cursor-grabbing"
                        >
                          <p className="text-sm font-semibold text-ink">{p.name}</p>
                          <p className="text-xs text-ink-muted">{p.code} · {getCustomerName(p.client)}</p>
                          <ProgressBar value={p.progress} color="auto" showLabel />
                          <div className="flex items-center justify-between text-xs text-ink-faint">
                            <span>{formatCurrency(p.budget, { compact: true })}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(p.deadline)}</span>
                          </div>
                        </div>
                      ))}
                      {items.length === 0 && <p className="px-2 py-6 text-center text-xs text-ink-faint">Drop projects here</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </PageBody>
      )}

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Project' : 'Edit Project'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Create Project' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Project Name" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Name is required' })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Project Code" required error={errors.code?.message}>
              <Input {...register('code', { required: 'Code is required' })} placeholder="e.g. LAX-ABC-25" />
            </Field>
            <Field label="Type">
              <Select {...register('type')}>
                {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Client" required error={errors.client?.message}>
              <Select {...register('client', { required: 'Required' })}>
                <option value="">Select client</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Project Manager">
              <Select {...register('manager')}>
                {employees.filter((e) => e.role === 'Project Manager' || e.role === 'Architect').map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Location">
            <Input {...register('location')} placeholder="e.g. Bandra, Mumbai" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date"><Input type="date" {...register('startDate')} /></Field>
            <Field label="Deadline"><Input type="date" {...register('deadline')} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Budget (₹)"><Input type="number" {...register('budget')} /></Field>
            <Field label="Status">
              <Select {...register('status')}>
                {projectStatuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Description">
            <Textarea {...register('description')} placeholder="Brief project description…" />
          </Field>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this project?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
