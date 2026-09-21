import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { billingApi } from '../../api/billingApi'
import { logAudit } from '../../api/auditLogApi'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'
import { customers, getCustomerName } from '../../data/customers'
import { projects, getProjectName } from '../../data/projects'
import { formatCurrency, formatDate } from '../../utils/format'

const STATUS_OPTIONS = ['pending', 'partially-paid', 'overdue', 'paid']

export default function Invoices() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { can } = usePermissions()
  const allowCreate = can('billing', 'create')
  const allowEdit = can('billing', 'edit')
  const allowDelete = can('billing', 'delete')
  const table = useDataTable(billingApi.invoices.list, { pageSize: 8, initialFilters: { status: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ client: customers[0]?.id, project: projects[0]?.id, date: new Date().toISOString().slice(0, 10), dueDate: '', amount: '' })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset(record)
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const amount = Number(values.amount) || 0
      if (drawer.mode === 'create') {
        await billingApi.invoices.create({
          client: values.client,
          project: values.project,
          date: values.date,
          dueDate: values.dueDate,
          amount,
          paid: 0,
          status: 'pending',
          items: [{ desc: 'Professional Services', qty: 1, rate: amount }],
        })
        toast.success('Invoice created successfully')
      } else {
        await billingApi.invoices.update(drawer.record.id, { ...values, amount })
        toast.success('Invoice updated successfully')
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
    const balance = invoice.amount - invoice.paid
    if (balance <= 0) return
    try {
      await billingApi.markPaid(invoice.id, balance)
      logAudit({ user, action: 'Marked invoice as paid', module: 'Billing', record: invoice.id, change: 'status updated' })
      toast.success(`${invoice.id} marked as paid`)
      table.refresh()
    } catch (err) {
      toast.error(err.message || 'Failed to update invoice')
    }
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await billingApi.invoices.remove(confirm.record.id)
      toast.success('Invoice deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'id', header: 'Invoice Number', sortable: true },
    { key: 'client', header: 'Customer', render: (i) => getCustomerName(i.client) },
    { key: 'project', header: 'Project', render: (i) => getProjectName(i.project) },
    { key: 'date', header: 'Date', sortable: true, render: (i) => formatDate(i.date) },
    { key: 'dueDate', header: 'Due Date', sortable: true, render: (i) => formatDate(i.dueDate) },
    { key: 'amount', header: 'Amount', sortable: true, render: (i) => formatCurrency(i.amount, { compact: true }) },
    { key: 'paid', header: 'Paid', render: (i) => formatCurrency(i.paid, { compact: true }) },
    { key: 'balance', header: 'Balance', render: (i) => <span className="font-medium">{formatCurrency(i.amount - i.paid, { compact: true })}</span> },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (i) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-48" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && i.status !== 'paid' && (
                  <DropdownItem icon={CheckCircle2} onClick={() => handleMarkPaid(i)}>Mark Paid</DropdownItem>
                )}
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
        title="Invoices"
        subtitle={`${table.total} invoices raised`}
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
            onRowClick={(row) => navigate(`/billing/invoices/${row.id}`)}
            page={table.page}
            pageSize={table.pageSize}
            total={table.total}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
            emptyState={{ title: 'No invoices found', description: 'Create your first invoice to start billing clients.', action: allowCreate ? { label: 'New Invoice', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => billingApi.invoices.remove(id))); toast.success(`${ids.length} invoice(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search invoices…" className="w-full max-w-xs" />
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[150px]">
                  <option value="all">All Status</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Invoice' : 'Edit Invoice'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Create Invoice' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Client" required error={errors.client?.message}>
            <Select {...register('client', { required: 'Client is required' })}>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Project" required error={errors.project?.message}>
            <Select {...register('project', { required: 'Project is required' })}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Invoice Date" required error={errors.date?.message}>
              <Input type="date" {...register('date', { required: 'Date is required' })} />
            </Field>
            <Field label="Due Date" required error={errors.dueDate?.message}>
              <Input type="date" {...register('dueDate', { required: 'Due date is required' })} />
            </Field>
          </div>
          <Field label="Amount (₹)" required error={errors.amount?.message}>
            <Input type="number" {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Amount must be greater than 0' } })} />
          </Field>
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
