import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Clock3, Receipt, ReceiptText, Percent } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, KPICard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input, Textarea, Checkbox } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Badge } from '../../components/ui/Badge'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { useDataTable } from '../../hooks/useDataTable'
import { timesheetApi } from '../../api/collaborationApi'
import { getEmployeeName, employees } from '../../data/employees'
import { getProjectName, projects } from '../../data/projects'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function Timesheets() {
  const { can } = usePermissions()
  const allowCreate = can('timesheets', 'create')
  const allowEdit = can('timesheets', 'edit')
  const allowDelete = can('timesheets', 'delete')
  const table = useDataTable(timesheetApi.list, { pageSize: 10, initialFilters: { billable: 'all', employee: 'all' } })
  const [summary, setSummary] = useState(null)
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  async function loadSummary() {
    const s = await timesheetApi.summary()
    setSummary(s)
  }

  useEffect(() => {
    loadSummary()
  }, [])

  function openCreate() {
    reset({ employee: employees[0]?.id, project: '', task: '', date: new Date().toISOString().slice(0, 10), hours: 8, billable: true, description: '' })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset({ ...record, project: record.project || '' })
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, project: values.project || null, hours: Number(values.hours) || 0, billable: !!values.billable }
      if (drawer.mode === 'create') {
        await timesheetApi.create(payload)
        toast.success('Time entry logged')
      } else {
        await timesheetApi.update(drawer.record.id, payload)
        toast.success('Time entry updated')
      }
      setDrawer({ open: false, mode: 'create', record: null })
      table.refresh()
      loadSummary()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await timesheetApi.remove(confirm.record.id)
      toast.success('Time entry deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
      loadSummary()
    } finally {
      setSaving(false)
    }
  }

  const utilization = summary && summary.total ? Math.round((summary.billable / summary.total) * 100) : 0

  const columns = [
    { key: 'date', header: 'Date', sortable: true, render: (t) => formatDate(t.date) },
    { key: 'employee', header: 'Employee', render: (t) => getEmployeeName(t.employee) },
    { key: 'project', header: 'Project', render: (t) => (t.project ? getProjectName(t.project) : 'Internal') },
    { key: 'task', header: 'Task', render: (t) => <span className="text-ink-muted">{t.task}</span> },
    { key: 'hours', header: 'Hours', sortable: true, render: (t) => `${t.hours}h` },
    { key: 'billable', header: 'Billable', render: (t) => <Badge color={t.billable ? 'success' : 'neutral'}>{t.billable ? 'Yes' : 'No'}</Badge> },
    { key: 'description', header: 'Description', render: (t) => <span className="line-clamp-1 text-ink-muted">{t.description}</span> },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (t) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-44" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(t)}>Edit</DropdownItem>}
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
        title="Timesheets"
        subtitle={`${table.total} time entries logged`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>Log Time</Button> : null}
      />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {!summary ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Total Hours" value={`${summary.total}h`} icon={Clock3} accent="brand" trend="neutral" />
              <KPICard label="Billable Hours" value={`${summary.billable}h`} icon={Receipt} accent="success" trend="neutral" />
              <KPICard label="Non-Billable" value={`${summary.nonBillable}h`} icon={ReceiptText} accent="warning" trend="neutral" />
              <KPICard label="Utilization" value={`${utilization}%`} icon={Percent} accent="info" trend="neutral" />
            </>
          )}
        </div>

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
            emptyState={{ title: 'No time entries found', description: 'Log your first time entry to start tracking hours.', action: allowCreate ? { label: 'Log Time', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => timesheetApi.remove(id))); toast.success(`${ids.length} entr${ids.length > 1 ? 'ies' : 'y'} deleted`); setSelected([]); table.refresh(); loadSummary() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search tasks…" className="w-full max-w-xs" />
                <Select value={table.filters.billable} onChange={(e) => table.setFilters((p) => ({ ...p, billable: e.target.value === 'all' ? 'all' : e.target.value === 'true' }))} className="w-auto min-w-[130px]">
                  <option value="all">All Entries</option>
                  <option value="true">Billable</option>
                  <option value="false">Non-Billable</option>
                </Select>
                <Select value={table.filters.employee} onChange={(e) => table.setFilters((p) => ({ ...p, employee: e.target.value }))} className="w-auto min-w-[160px]">
                  <option value="all">All Employees</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'Log Time' : 'Edit Time Entry'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Log Time' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Employee">
            <Select {...register('employee')}>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
          </Field>
          <Field label="Project">
            <Select {...register('project')}>
              <option value="">Internal (no project)</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Task" required error={errors.task?.message}>
            <Input {...register('task', { required: 'Task is required' })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <Input type="date" {...register('date')} />
            </Field>
            <Field label="Hours">
              <Input type="number" step="0.5" min="0" {...register('hours')} />
            </Field>
          </div>
          <Checkbox label="Billable" {...register('billable')} />
          <Field label="Description">
            <Textarea {...register('description')} placeholder="What did you work on?" />
          </Field>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this time entry?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
