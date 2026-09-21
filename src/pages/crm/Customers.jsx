import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, MoreHorizontal, ArrowUpRight } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { useDataTable } from '../../hooks/useDataTable'
import { crmApi } from '../../api/crmApi'
import { projects } from '../../data/projects'
import { invoices } from '../../data/invoices'
import { formatCurrency, formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function Customers() {
  const { can } = usePermissions()
  const allowCreate = can('crm', 'create')
  const allowEdit = can('crm', 'edit')
  const allowDelete = can('crm', 'delete')
  const table = useDataTable(crmApi.customers.list, { pageSize: 8, initialFilters: { type: 'all', status: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ type: 'Individual', status: 'active' })
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
        await crmApi.customers.create({ ...values, since: new Date().toISOString().slice(0, 10) })
        toast.success('Customer created')
      } else {
        await crmApi.customers.update(drawer.record.id, values)
        toast.success('Customer updated')
      }
      setDrawer({ open: false, mode: 'create', record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }
  async function confirmDelete() {
    setSaving(true)
    try {
      await crmApi.customers.remove(confirm.record.id)
      toast.success('Customer deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Customer', sortable: true, render: (c) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={c.name} size="sm" />
        <div>
          <p className="font-medium text-ink">{c.name}</p>
          <p className="text-xs text-ink-faint">{c.city}</p>
        </div>
      </div>
    )},
    { key: 'category', header: 'Type', render: (c) => <Badge>{c.category}</Badge> },
    { key: 'contact', header: 'Contact' },
    { key: 'activeProjects', header: 'Active Projects', render: (c) => projects.filter((p) => p.client === c.id && p.status === 'in-progress').length },
    { key: 'revenue', header: 'Revenue', render: (c) => formatCurrency(invoices.filter((i) => i.client === c.id).reduce((s, i) => s + i.paid, 0), { compact: true }) },
    { key: 'outstanding', header: 'Outstanding', render: (c) => formatCurrency(invoices.filter((i) => i.client === c.id).reduce((s, i) => s + (i.amount - i.paid), 0), { compact: true }) },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    { key: '__actions', header: '', className: 'text-right', render: (c) => (
      <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
        <Dropdown align="right" width="w-44" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
          <DropdownItem icon={ArrowUpRight} onClick={() => navigate(`/crm/customers/${c.id}`)}>Open profile</DropdownItem>
          {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(c)}>Edit</DropdownItem>}
          {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: c })}>Delete</DropdownItem>}
        </Dropdown>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${table.total} customers across your organization`} actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Customer</Button> : undefined} />
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
            onRowClick={(c) => navigate(`/crm/customers/${c.id}`)}
            page={table.page}
            pageSize={table.pageSize}
            total={table.total}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
            emptyState={{ title: 'No customers found', description: 'Create your first customer to get started.', action: allowCreate ? { label: 'New Customer', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => crmApi.customers.remove(id))); toast.success(`${ids.length} deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search customers…" className="w-full max-w-xs" />
                <Select value={table.filters.type} onChange={(e) => table.setFilters((p) => ({ ...p, type: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Types</option>
                  <option value="Individual">Individual</option>
                  <option value="Corporate">Corporate</option>
                </Select>
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
        title={drawer.mode === 'create' ? 'New Customer' : 'Edit Customer'}
        footer={<><Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button><Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Create' : 'Save changes'}</Button></>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Name" required error={errors.name?.message}><Input {...register('name', { required: 'Required' })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type"><Select {...register('type')}><option value="Individual">Individual</option><option value="Corporate">Corporate</option></Select></Field>
            <Field label="Category"><Input {...register('category')} placeholder="Homeowner, Developer…" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" required error={errors.contact?.message}><Input {...register('contact', { required: 'Required' })} /></Field>
            <Field label="Email" required error={errors.email?.message}><Input type="email" {...register('email', { required: 'Required' })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City"><Input {...register('city')} /></Field>
            <Field label="GSTIN"><Input {...register('gstin')} /></Field>
          </div>
          <Field label="Status"><Select {...register('status')}><option value="active">Active</option><option value="inactive">Inactive</option></Select></Field>
        </form>
      </Drawer>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, record: null })} onConfirm={confirmDelete} loading={saving} title="Delete this customer?" description="This action cannot be undone." confirmLabel="Delete" />
    </div>
  )
}
