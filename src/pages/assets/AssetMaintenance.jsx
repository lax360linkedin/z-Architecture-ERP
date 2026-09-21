import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, MoreHorizontal, CheckCircle2 } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Dropdown, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown'
import { StatusBadge } from '../../components/ui/Badge'
import { useDataTable } from '../../hooks/useDataTable'
import { assetApi } from '../../api/assetApi'
import { assets } from '../../data/assets'
import { formatCurrency, formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

const maintenanceStatuses = ['in-progress', 'completed']

export default function AssetMaintenance() {
  const { can } = usePermissions()
  const allowCreate = can('assets', 'create')
  const allowEdit = can('assets', 'edit')
  const allowDelete = can('assets', 'delete')
  const table = useDataTable(assetApi.maintenance.list, { pageSize: 8, initialFilters: { status: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ asset: assets[0]?.id || '', type: '', date: '', cost: '', status: 'in-progress' })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset(record)
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, cost: Number(values.cost) || 0 }
      if (drawer.mode === 'create') {
        await assetApi.maintenance.create(payload)
        toast.success('Maintenance record added')
      } else {
        await assetApi.maintenance.update(drawer.record.id, payload)
        toast.success('Maintenance record updated')
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
      await assetApi.maintenance.remove(confirm.record.id)
      toast.success('Maintenance record deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function markCompleted(record) {
    await assetApi.maintenance.update(record.id, { status: 'completed' })
    toast.success(`${record.type} marked as completed`)
    table.refresh()
  }

  const columns = [
    { key: 'asset', header: 'Asset', render: (r) => assets.find((a) => a.id === r.asset)?.name || r.asset },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'date', header: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    { key: 'cost', header: 'Cost', sortable: true, render: (r) => formatCurrency(r.cost, { compact: true }) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (r) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-48" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(r)}>Edit</DropdownItem>}
                {allowEdit && r.status === 'in-progress' && (
                  <DropdownItem icon={CheckCircle2} onClick={() => markCompleted(r)}>Mark Completed</DropdownItem>
                )}
                {allowEdit && allowDelete && <DropdownSeparator />}
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
        title="Asset Maintenance"
        subtitle={`${table.total} maintenance records`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Record</Button> : null}
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
            emptyState={{ title: 'No maintenance records found', description: 'Log your first maintenance record.', action: allowCreate ? { label: 'New Record', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => assetApi.maintenance.remove(id))); toast.success(`${ids.length} record(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search maintenance…" className="w-full max-w-xs" />
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[150px]">
                  <option value="all">All Status</option>
                  {maintenanceStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Maintenance Record' : 'Edit Maintenance Record'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Add Record' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Asset">
            <Select {...register('asset')}>
              {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </Field>
          <Field label="Type" required error={errors.type?.message}>
            <Input placeholder="e.g. Scheduled Service" {...register('type', { required: 'Type is required' })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><Input type="date" {...register('date')} /></Field>
            <Field label="Cost (₹)"><Input type="number" {...register('cost')} /></Field>
          </div>
          <Field label="Status">
            <Select {...register('status')}>
              {maintenanceStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this maintenance record?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
