import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Send, FileEdit, MoreHorizontal } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input, Textarea } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { StatusBadge } from '../../components/ui/Badge'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { useDataTable } from '../../hooks/useDataTable'
import { salesApi } from '../../api/salesApi'
import { customers } from '../../data/customers'
import { projects } from '../../data/projects'
import { getCustomerName } from '../../data/customers'
import { getProjectName } from '../../data/projects'
import { getEmployeeName, employees } from '../../data/employees'
import { formatCurrency, formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

const quotationStatuses = ['draft', 'sent', 'approved', 'rejected']

const emptyItem = { service: '', qty: 1, unit: 'Lumpsum', rate: 0 }

export default function Quotations() {
  const navigate = useNavigate()
  const { can } = usePermissions()
  const allowCreate = can('sales', 'create')
  const allowEdit = can('sales', 'edit')
  const allowDelete = can('sales', 'delete')
  const table = useDataTable(salesApi.quotations.list, { pageSize: 8, initialFilters: { status: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm({
    defaultValues: { client: '', project: '', title: '', date: '', validity: '', discount: 0, tax: 18, terms: '', owner: 'EMP-002', items: [emptyItem] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const watchedItems = watch('items')
  const watchedDiscount = watch('discount')
  const watchedTax = watch('tax')

  const liveTotals = useMemo(() => {
    const items = (watchedItems || []).map((i) => ({ ...i, qty: Number(i.qty) || 0, rate: Number(i.rate) || 0 }))
    return salesApi.quotationTotals({ items, discount: Number(watchedDiscount) || 0, tax: Number(watchedTax) || 0 })
  }, [watchedItems, watchedDiscount, watchedTax])

  function openCreate() {
    reset({ client: customers[0]?.id || '', project: '', title: '', date: new Date().toISOString().slice(0, 10), validity: '', discount: 0, tax: 18, terms: '', owner: 'EMP-002', items: [emptyItem] })
    setDrawer({ open: true, mode: 'create', record: null })
  }

  function openEdit(record) {
    reset({ ...record, items: record.items?.length ? record.items : [emptyItem] })
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function submitWithStatus(values, status) {
    setSaving(true)
    try {
      const payload = {
        ...values,
        status,
        discount: Number(values.discount) || 0,
        tax: Number(values.tax) || 0,
        items: values.items.map((i) => ({ ...i, qty: Number(i.qty) || 0, rate: Number(i.rate) || 0 })),
      }
      if (drawer.mode === 'create') {
        await salesApi.quotations.create(payload)
        toast.success(status === 'sent' ? 'Quotation sent to client' : 'Quotation saved as draft')
      } else {
        await salesApi.quotations.update(drawer.record.id, payload)
        toast.success('Quotation updated successfully')
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
      await salesApi.quotations.remove(confirm.record.id)
      toast.success('Quotation deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'id', header: 'ID', sortable: true, render: (q) => <span className="font-medium text-ink">{q.id}</span> },
    { key: 'title', header: 'Title', render: (q) => <span className="line-clamp-1 max-w-[220px]">{q.title}</span> },
    { key: 'client', header: 'Client', render: (q) => getCustomerName(q.client) },
    { key: 'project', header: 'Project', render: (q) => getProjectName(q.project) },
    { key: 'date', header: 'Date', sortable: true, render: (q) => formatDate(q.date) },
    { key: 'total', header: 'Total', render: (q) => formatCurrency(salesApi.quotationTotals(q).total, { compact: true }) },
    { key: 'status', header: 'Status', render: (q) => <StatusBadge status={q.status} /> },
    { key: 'owner', header: 'Owner', render: (q) => getEmployeeName(q.owner) },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (q) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-44" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(q)}>Edit</DropdownItem>}
                {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: q })}>Delete</DropdownItem>}
              </Dropdown>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Quotations"
        subtitle={`${table.total} quotations`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Quotation</Button> : undefined}
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
            onRowClick={(row) => navigate(`/sales/quotations/${row.id}`)}
            page={table.page}
            pageSize={table.pageSize}
            total={table.total}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
            emptyState={{ title: 'No quotations found', description: 'Create your first quotation to get started.', action: allowCreate ? { label: 'New Quotation', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => salesApi.quotations.remove(id))); toast.success(`${ids.length} quotation(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search quotations…" className="w-full max-w-xs" />
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Status</option>
                  {quotationStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Quotation' : 'Edit Quotation'}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button variant="secondary" icon={FileEdit} loading={saving} onClick={handleSubmit((v) => submitWithStatus(v, 'draft'))}>Save Draft</Button>
            <Button icon={Send} loading={saving} onClick={handleSubmit((v) => submitWithStatus(v, 'sent'))}>Send to Client</Button>
          </>
        }
      >
        <form className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Client" required error={errors.client?.message}>
              <Select {...register('client', { required: 'Required' })}>
                <option value="">Select client</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Project">
              <Select {...register('project')}>
                <option value="">None</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Title" required error={errors.title?.message}>
            <Input {...register('title', { required: 'Title is required' })} placeholder="e.g. Villa - Full Architectural Services" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Date"><Input type="date" {...register('date')} /></Field>
            <Field label="Valid Until"><Input type="date" {...register('validity')} /></Field>
            <Field label="Owner">
              <Select {...register('owner')}>
                {employees.filter((e) => ['Sales Manager', 'Employee', 'Project Manager', 'Architect'].includes(e.role)).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-muted">Line Items</span>
              <Button type="button" size="sm" variant="secondary" icon={Plus} onClick={() => append(emptyItem)}>Add Item</Button>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
              {fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-12 items-end gap-2">
                  <div className="col-span-5">
                    {idx === 0 && <label className="mb-1 block text-[11px] text-ink-faint">Service</label>}
                    <Input {...register(`items.${idx}.service`, { required: true })} placeholder="Service description" />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className="mb-1 block text-[11px] text-ink-faint">Qty</label>}
                    <Input type="number" step="any" {...register(`items.${idx}.qty`)} />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className="mb-1 block text-[11px] text-ink-faint">Unit</label>}
                    <Input {...register(`items.${idx}.unit`)} placeholder="Unit" />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className="mb-1 block text-[11px] text-ink-faint">Rate (₹)</label>}
                    <Input type="number" step="any" {...register(`items.${idx}.rate`)} />
                  </div>
                  <div className="col-span-1 flex justify-end pb-1.5">
                    <button type="button" disabled={fields.length === 1} onClick={() => remove(idx)} className="text-ink-faint hover:text-red-500 disabled:opacity-30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Discount (%)"><Input type="number" step="any" {...register('discount')} /></Field>
            <Field label="Tax / GST (%)"><Input type="number" step="any" {...register('tax')} /></Field>
          </div>

          <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface-subtle p-3 text-sm">
            <div className="flex justify-between text-ink-muted"><span>Subtotal</span><span>{formatCurrency(liveTotals.subtotal)}</span></div>
            <div className="flex justify-between text-ink-muted"><span>Discount</span><span>- {formatCurrency(liveTotals.discountAmt)}</span></div>
            <div className="flex justify-between text-ink-muted"><span>Tax</span><span>+ {formatCurrency(liveTotals.taxAmt)}</span></div>
            <div className="mt-1 flex justify-between border-t border-border pt-1.5 text-sm font-semibold text-ink"><span>Total</span><span>{formatCurrency(liveTotals.total)}</span></div>
          </div>

          <Field label="Payment Terms">
            <Textarea {...register('terms')} placeholder="e.g. 50% advance, balance on completion." />
          </Field>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this quotation?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
