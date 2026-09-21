import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Star, MoreHorizontal, Eye } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { StatusBadge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { useDataTable } from '../../hooks/useDataTable'
import { vendorApi } from '../../api/vendorApi'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

const CATEGORY = 'Subcontractor'

export default function Subcontractors() {
  const navigate = useNavigate()
  const { can } = usePermissions()
  const allowCreate = can('vendors', 'create')
  const allowEdit = can('vendors', 'edit')
  const allowDelete = can('vendors', 'delete')
  const table = useDataTable(vendorApi.list, { pageSize: 8, initialFilters: { category: CATEGORY, status: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ category: CATEGORY, status: 'active', rating: 4, since: new Date().toISOString().slice(0, 10) })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset(record)
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, category: CATEGORY, rating: Number(values.rating) || 0 }
      if (drawer.mode === 'create') {
        await vendorApi.create(payload)
        toast.success('Subcontractor created successfully')
      } else {
        await vendorApi.update(drawer.record.id, payload)
        toast.success('Subcontractor updated successfully')
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
      await vendorApi.remove(confirm.record.id)
      toast.success('Subcontractor deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'name', header: 'Name', sortable: true, render: (v) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={v.name} size="sm" />
          <p className="font-medium text-ink">{v.name}</p>
        </div>
      ),
    },
    { key: 'contact', header: 'Contact' },
    { key: 'city', header: 'City' },
    {
      key: 'rating', header: 'Rating', sortable: true, render: (v) => (
        <span className="flex items-center gap-1 font-medium text-ink"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{v.rating.toFixed(1)}</span>
      ),
    },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status} /> },
    { key: 'since', header: 'Since', render: (v) => formatDate(v.since) },
    {
      key: '__actions', header: '', className: 'text-right', render: (v) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <Dropdown align="right" width="w-48" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
            <DropdownItem icon={Eye} onClick={() => navigate(`/vendors/${v.id}`)}>View details</DropdownItem>
            {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(v)}>Edit</DropdownItem>}
            {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: v })}>Delete</DropdownItem>}
          </Dropdown>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Subcontractors"
        subtitle={`${table.total} subcontractors engaged for specialized packages`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Subcontractor</Button> : null}
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
            onRowClick={(v) => navigate(`/vendors/${v.id}`)}
            page={table.page}
            pageSize={table.pageSize}
            total={table.total}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
            emptyState={{ title: 'No subcontractors found', description: 'Add your first subcontractor to get started.', action: allowCreate ? { label: 'New Subcontractor', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => vendorApi.remove(id))); toast.success(`${ids.length} subcontractor(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search subcontractors…" className="w-full max-w-xs" />
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
        title={drawer.mode === 'create' ? 'New Subcontractor' : 'Edit Subcontractor'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Create Subcontractor' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Subcontractor Name" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Name is required' })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact Phone" required error={errors.contact?.message}>
              <Input {...register('contact', { required: 'Phone is required' })} />
            </Field>
            <Field label="Email" required error={errors.email?.message}>
              <Input type="email" {...register('email', { required: 'Email is required' })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City" required error={errors.city?.message}>
              <Input {...register('city', { required: 'City is required' })} />
            </Field>
            <Field label="GSTIN">
              <Input {...register('gstin')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rating (0-5)">
              <Input type="number" step="0.1" min="0" max="5" {...register('rating')} />
            </Field>
            <Field label="Status">
              <Select {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Field>
          </div>
          <Field label="Engaged Since">
            <Input type="date" {...register('since')} />
          </Field>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this subcontractor?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
