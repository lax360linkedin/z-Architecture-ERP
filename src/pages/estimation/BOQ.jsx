import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Trash2, Download } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select, Field, Input } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Badge } from '../../components/ui/Badge'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { Pencil, MoreHorizontal } from 'lucide-react'
import { useDataTable } from '../../hooks/useDataTable'
import { boqApi } from '../../api/boqApi'
import { projects } from '../../data/projects'
import { formatCurrency } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function BOQ() {
  const { can } = usePermissions()
  const allowCreate = can('estimation', 'create')
  const allowEdit = can('estimation', 'edit')
  const allowDelete = can('estimation', 'delete')
  const [projectId, setProjectId] = useState(projects[0]?.id)
  const table = useDataTable(boqApi.items.list, { pageSize: 8, initialFilters: { project: projectId, category: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function handleProjectChange(id) {
    setProjectId(id)
    table.setFilters((p) => ({ ...p, project: id }))
  }

  function openCreate() {
    reset({ project: projectId, itemCode: '', description: '', category: boqApi.categories[0], unit: '', quantity: 0, rate: 0, tax: 18 })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset(record)
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, quantity: Number(values.quantity) || 0, rate: Number(values.rate) || 0, tax: Number(values.tax) || 0 }
      if (drawer.mode === 'create') {
        await boqApi.items.create(payload)
        toast.success('BOQ item added')
      } else {
        await boqApi.items.update(drawer.record.id, payload)
        toast.success('BOQ item updated')
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
      await boqApi.items.remove(confirm.record.id)
      toast.success('BOQ item deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const pageTotal = useMemo(() => table.items.reduce((sum, item) => sum + boqApi.boqTotal(item), 0), [table.items])

  const columns = [
    { key: 'itemCode', header: 'Item Code', sortable: true, render: (i) => <span className="font-medium text-ink">{i.itemCode}</span> },
    { key: 'description', header: 'Description', render: (i) => <span className="max-w-xs truncate">{i.description}</span> },
    { key: 'category', header: 'Category', render: (i) => <Badge>{i.category}</Badge> },
    { key: 'unit', header: 'Unit' },
    { key: 'quantity', header: 'Quantity', sortable: true, render: (i) => i.quantity.toLocaleString('en-IN') },
    { key: 'rate', header: 'Rate', sortable: true, render: (i) => formatCurrency(i.rate) },
    { key: 'amount', header: 'Amount', render: (i) => formatCurrency(i.quantity * i.rate, { compact: true }) },
    { key: 'tax', header: 'Tax %', render: (i) => `${i.tax}%` },
    { key: 'total', header: 'Total', render: (i) => <span className="font-semibold text-ink">{formatCurrency(boqApi.boqTotal(i), { compact: true })}</span> },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (i) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-40" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
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
        title="Bill of Quantities"
        subtitle={`${table.total} items · ${formatCurrency(pageTotal, { compact: true })} on this page`}
        actions={
          <>
            <Select value={projectId} onChange={(e) => handleProjectChange(e.target.value)} className="w-auto min-w-[200px]">
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Button variant="secondary" icon={Download} onClick={() => toast.success('BOQ exported')}>Export</Button>
            {allowCreate && <Button icon={Plus} onClick={openCreate}>Add Item</Button>}
          </>
        }
      />
      <PageBody className="flex flex-col gap-4">
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
            emptyState={{ title: 'No BOQ items found', description: 'Add the first item for this project.', action: allowCreate ? { label: 'Add Item', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => boqApi.items.remove(id))); toast.success(`${ids.length} item(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <Select value={table.filters.category} onChange={(e) => table.setFilters((p) => ({ ...p, category: e.target.value }))} className="w-auto min-w-[160px]">
                <option value="all">All Categories</option>
                {boqApi.categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            }
          />
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-ink-muted">Total BOQ Value — {projects.find((p) => p.id === projectId)?.name}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-ink font-[Inter_Tight]">{formatCurrency(pageTotal, { compact: true })}</p>
          </div>
          <p className="text-xs text-ink-faint">Sum of item amount + tax on this page ({table.items.length} of {table.total} items)</p>
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'Add BOQ Item' : 'Edit BOQ Item'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Add Item' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Project" required>
            <Select {...register('project', { required: true })}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Item Code" required error={errors.itemCode?.message}>
              <Input {...register('itemCode', { required: 'Item code is required' })} placeholder="CIV-101" />
            </Field>
            <Field label="Category">
              <Select {...register('category')}>
                {boqApi.categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Description" required error={errors.description?.message}>
            <Input {...register('description', { required: 'Description is required' })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Unit">
              <Input {...register('unit')} placeholder="Sqm, Cum, Kg…" />
            </Field>
            <Field label="Quantity">
              <Input type="number" step="any" {...register('quantity')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rate (₹)">
              <Input type="number" step="any" {...register('rate')} />
            </Field>
            <Field label="Tax %">
              <Input type="number" step="any" {...register('tax')} />
            </Field>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this BOQ item?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
