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
import { procurementApi } from '../../api/procurementApi'
import { purchaseOrders } from '../../data/procurement'
import { vendors, getVendorName } from '../../data/vendors'
import { formatCurrency, formatDate } from '../../utils/format'
import { ProcurementWorkflowBanner } from './PurchaseRequests'
import { usePermissions } from '../../context/PermissionContext'

export default function PurchaseInvoices() {
  const { can } = usePermissions()
  const allowCreate = can('procurement', 'create')
  const allowEdit = can('procurement', 'edit')
  const allowDelete = can('procurement', 'delete')
  const table = useDataTable(procurementApi.purchaseInvoices.list, { pageSize: 8, initialFilters: { status: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ status: 'pending', date: new Date().toISOString().slice(0, 10) })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset(record)
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, amount: Number(values.amount) || 0 }
      if (drawer.mode === 'create') {
        await procurementApi.purchaseInvoices.create(payload)
        toast.success('Purchase invoice created successfully')
      } else {
        await procurementApi.purchaseInvoices.update(drawer.record.id, payload)
        toast.success('Purchase invoice updated successfully')
      }
      setDrawer({ open: false, mode: 'create', record: null })
      table.refresh()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleMarkPaid(invoice) {
    try {
      await procurementApi.purchaseInvoices.update(invoice.id, { status: 'paid' })
      toast.success(`${invoice.id} marked as paid`)
      table.refresh()
    } catch (err) {
      toast.error(err.message || 'Failed to update invoice')
    }
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await procurementApi.purchaseInvoices.remove(confirm.record.id)
      toast.success('Purchase invoice deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'id', header: 'Invoice ID', sortable: true },
    { key: 'po', header: 'PO Ref' },
    { key: 'vendor', header: 'Vendor', render: (r) => getVendorName(r.vendor) },
    { key: 'amount', header: 'Amount', sortable: true, render: (r) => formatCurrency(r.amount, { compact: true }) },
    { key: 'date', header: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    { key: 'dueDate', header: 'Due Date', render: (r) => formatDate(r.dueDate) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (r) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-48" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(r)}>Edit</DropdownItem>}
                {allowEdit && r.status !== 'paid' && (
                  <DropdownItem icon={CheckCircle2} onClick={() => handleMarkPaid(r)}>Mark Paid</DropdownItem>
                )}
                {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: r })}>Delete</DropdownItem>}
              </Dropdown>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <ProcurementWorkflowBanner current="Invoice" />
      </div>
      <PageHeader
        title="Purchase Invoices"
        subtitle={`${table.total} vendor invoices on record`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Invoice</Button> : null}
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
            emptyState={{ title: 'No purchase invoices found', description: 'Invoices raised by vendors against POs will appear here.', action: allowCreate ? { label: 'New Invoice', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => procurementApi.purchaseInvoices.remove(id))); toast.success(`${ids.length} invoice(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search invoices…" className="w-full max-w-xs" />
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Purchase Invoice' : 'Edit Purchase Invoice'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Create Invoice' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Purchase Order" required error={errors.po?.message}>
            <Select {...register('po', { required: 'PO is required' })}>
              <option value="">Select PO</option>
              {purchaseOrders.map((p) => <option key={p.id} value={p.id}>{p.id} — {p.item}</option>)}
            </Select>
          </Field>
          <Field label="Vendor" required error={errors.vendor?.message}>
            <Select {...register('vendor', { required: 'Vendor is required' })}>
              <option value="">Select vendor</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (₹)" required error={errors.amount?.message}>
              <Input type="number" {...register('amount', { required: 'Amount is required' })} />
            </Field>
            <Field label="Status">
              <Select {...register('status')}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Invoice Date" required error={errors.date?.message}>
              <Input type="date" {...register('date', { required: 'Date is required' })} />
            </Field>
            <Field label="Due Date" required error={errors.dueDate?.message}>
              <Input type="date" {...register('dueDate', { required: 'Due date is required' })} />
            </Field>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this invoice?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
