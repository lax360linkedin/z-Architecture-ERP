import { useState } from 'react'
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
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { useDataTable } from '../../hooks/useDataTable'
import { assetApi } from '../../api/assetApi'
import { assetCategories } from '../../data/assets'
import { getEmployeeName, employees } from '../../data/employees'
import { formatCurrency, formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

const assetStatuses = ['in-use', 'idle', 'maintenance']

export default function Assets() {
  const { can } = usePermissions()
  const allowCreate = can('assets', 'create')
  const allowEdit = can('assets', 'edit')
  const allowDelete = can('assets', 'delete')
  const table = useDataTable(assetApi.assets.list, { pageSize: 8, initialFilters: { category: 'all', status: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ name: '', category: assetCategories[0], purchaseDate: '', cost: '', assignedTo: '', warrantyUntil: '', status: 'in-use' })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset({ ...record, assignedTo: record.assignedTo || '' })
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, cost: Number(values.cost) || 0, assignedTo: values.assignedTo || null }
      if (drawer.mode === 'create') {
        await assetApi.assets.create(payload)
        toast.success('Asset added')
      } else {
        await assetApi.assets.update(drawer.record.id, payload)
        toast.success('Asset updated')
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
      await assetApi.assets.remove(confirm.record.id)
      toast.success('Asset deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'id', header: 'Asset ID', render: (a) => <span className="font-medium text-ink">{a.id}</span> },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'category', header: 'Category', render: (a) => <Badge>{a.category}</Badge> },
    { key: 'purchaseDate', header: 'Purchase Date', sortable: true, render: (a) => formatDate(a.purchaseDate) },
    { key: 'cost', header: 'Cost', sortable: true, render: (a) => formatCurrency(a.cost, { compact: true }) },
    { key: 'assignedTo', header: 'Assigned To', render: (a) => (a.assignedTo ? getEmployeeName(a.assignedTo) : 'Unassigned') },
    { key: 'warrantyUntil', header: 'Warranty Until', render: (a) => formatDate(a.warrantyUntil) },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (a) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-44" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(a)}>Edit</DropdownItem>}
                {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: a })}>Delete</DropdownItem>}
              </Dropdown>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Assets"
        subtitle={`${table.total} assets tracked`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Asset</Button> : null}
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
            emptyState={{ title: 'No assets found', description: 'Add your first asset to get started.', action: allowCreate ? { label: 'New Asset', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => assetApi.assets.remove(id))); toast.success(`${ids.length} asset(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search assets…" className="w-full max-w-xs" />
                <Select value={table.filters.category} onChange={(e) => table.setFilters((p) => ({ ...p, category: e.target.value }))} className="w-auto min-w-[150px]">
                  <option value="all">All Categories</option>
                  {assetCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Status</option>
                  {assetStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Asset' : 'Edit Asset'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Add Asset' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Asset Name" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Name is required' })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select {...register('category')}>
                {assetCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select {...register('status')}>
                {assetStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Purchase Date"><Input type="date" {...register('purchaseDate')} /></Field>
            <Field label="Cost (₹)"><Input type="number" {...register('cost')} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Assigned To">
              <Select {...register('assignedTo')}>
                <option value="">Unassigned</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
            <Field label="Warranty Until"><Input type="date" {...register('warrantyUntil')} /></Field>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this asset?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
