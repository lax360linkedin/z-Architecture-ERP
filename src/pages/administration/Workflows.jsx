import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
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
import { adminApi } from '../../api/adminApi'
import { MODULES } from '../../utils/constants'
import { usePermissions } from '../../context/PermissionContext'

export default function Workflows() {
  const { can } = usePermissions()
  const allowCreate = can('administration', 'create')
  const allowEdit = can('administration', 'edit')
  const allowDelete = can('administration', 'delete')
  const table = useDataTable(adminApi.workflows.list, { pageSize: 8, initialFilters: { status: 'all' } })
  const [modules, setModules] = useState(MODULES)
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    adminApi.permissionModules().then((mods) => {
      if (mods?.length) setModules(mods)
    })
  }, [])

  function openCreate() {
    reset({ name: '', module: modules[0], steps: '', threshold: '', status: 'active' })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset({ ...record, steps: (record.steps || []).join(', ') })
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, steps: values.steps.split(',').map((s) => s.trim()).filter(Boolean) }
      if (drawer.mode === 'create') {
        await adminApi.workflows.create(payload)
        toast.success('Workflow created successfully')
      } else {
        await adminApi.workflows.update(drawer.record.id, payload)
        toast.success('Workflow updated successfully')
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
      await adminApi.workflows.remove(confirm.record.id)
      toast.success('Workflow deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'module', header: 'Module', sortable: true },
    { key: 'steps', header: 'Approval Steps', render: (r) => <span className="text-xs text-ink-muted">{(r.steps || []).join(' → ')}</span> },
    { key: 'threshold', header: 'Threshold' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (r) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-44" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(r)}>Edit</DropdownItem>}
                {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: r })}>Delete</DropdownItem>}
              </Dropdown>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Workflows"
        subtitle={`${table.total} approval workflows configured`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Workflow</Button> : null}
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
            emptyState={{ title: 'No workflows found', description: 'Create your first approval workflow.', action: allowCreate ? { label: 'New Workflow', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => adminApi.workflows.remove(id))); toast.success(`${ids.length} workflow(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search workflows…" className="w-full max-w-xs" />
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Workflow' : 'Edit Workflow'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Create Workflow' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Workflow Name" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Name is required' })} />
          </Field>
          <Field label="Module" required error={errors.module?.message}>
            <Select {...register('module', { required: true })}>
              {modules.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </Field>
          <Field label="Approval Steps (comma-separated)" required error={errors.steps?.message} hint="e.g. Reporting Manager, Finance Manager, Director">
            <Input {...register('steps', { required: 'At least one approval step is required' })} placeholder="Reporting Manager, Finance Manager" />
          </Field>
          <Field label="Threshold">
            <Input {...register('threshold')} placeholder="e.g. ₹1,00,000+ or All requests" />
          </Field>
          <Field label="Status">
            <Select {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this workflow?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
