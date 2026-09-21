import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, CheckCircle2, MoreHorizontal } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { StatusBadge } from '../../components/ui/Badge'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { useDataTable } from '../../hooks/useDataTable'
import { siteApi } from '../../api/siteApi'
import { getEmployeeName, employees } from '../../data/employees'
import { getProjectName, projects } from '../../data/projects'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function Inspections() {
  const { can } = usePermissions()
  const allowCreate = can('site', 'create')
  const allowEdit = can('site', 'edit')
  const allowDelete = can('site', 'delete')
  const table = useDataTable(siteApi.inspections.list, { pageSize: 8, initialFilters: { status: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ project: projects[0]?.id, type: '', scheduledDate: new Date().toISOString().slice(0, 10), inspector: employees[0]?.id, status: 'scheduled' })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset(record)
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      if (drawer.mode === 'create') {
        await siteApi.inspections.create(values)
        toast.success('Inspection scheduled')
      } else {
        await siteApi.inspections.update(drawer.record.id, values)
        toast.success('Inspection updated')
      }
      setDrawer({ open: false, mode: 'create', record: null })
      table.refresh()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function markCompleted(inspection) {
    await siteApi.inspections.update(inspection.id, { status: 'completed' })
    toast.success('Inspection marked completed')
    table.refresh()
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await siteApi.inspections.remove(confirm.record.id)
      toast.success('Inspection deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'project', header: 'Project', render: (i) => getProjectName(i.project) },
    { key: 'type', header: 'Type', render: (i) => <span className="line-clamp-1">{i.type}</span> },
    { key: 'scheduledDate', header: 'Scheduled Date', sortable: true, render: (i) => formatDate(i.scheduledDate) },
    { key: 'inspector', header: 'Inspector', render: (i) => getEmployeeName(i.inspector) },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (i) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-48" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && i.status === 'scheduled' && <DropdownItem icon={CheckCircle2} onClick={() => markCompleted(i)}>Mark Completed</DropdownItem>}
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(i)}>Edit</DropdownItem>}
                {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: i })}>Delete</DropdownItem>}
              </Dropdown>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Inspections"
        subtitle={`${table.total} inspections scheduled`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>Schedule Inspection</Button> : null}
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
            emptyState={{ title: 'No inspections found', description: 'Schedule an inspection to see it listed here.', action: allowCreate ? { label: 'Schedule Inspection', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => siteApi.inspections.remove(id))); toast.success(`${ids.length} inspection(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search inspections…" className="w-full max-w-xs" />
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[140px]">
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'Schedule Inspection' : 'Edit Inspection'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Schedule' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Project">
            <Select {...register('project')}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Inspection Type" required error={errors.type?.message}>
            <Input {...register('type', { required: 'Required' })} placeholder="e.g. Structural Slab Inspection" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Scheduled Date">
              <Input type="date" {...register('scheduledDate')} />
            </Field>
            <Field label="Inspector">
              <Select {...register('inspector')}>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Status">
            <Select {...register('status')}>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </Select>
          </Field>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this inspection?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
