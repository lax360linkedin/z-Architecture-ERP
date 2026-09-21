import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { MultiSelect } from '../../components/ui/MultiSelect'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { StatusBadge } from '../../components/ui/Badge'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { MoreHorizontal } from 'lucide-react'
import { useDataTable } from '../../hooks/useDataTable'
import { procurementApi } from '../../api/procurementApi'
import { projects, getProjectName } from '../../data/projects'
import { vendors, getVendorName } from '../../data/vendors'
import { formatDate } from '../../utils/format'
import { ProcurementWorkflowBanner } from './PurchaseRequests'
import { usePermissions } from '../../context/PermissionContext'

export default function RFQ() {
  const { can } = usePermissions()
  const allowCreate = can('procurement', 'create')
  const allowEdit = can('procurement', 'edit')
  const allowDelete = can('procurement', 'delete')
  const table = useDataTable(procurementApi.rfqs.list, { pageSize: 8, initialFilters: { status: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: { project: '', item: '', dueDate: '', status: 'open', vendorsInvited: [] },
  })

  function openCreate() {
    reset({ project: '', item: '', dueDate: '', status: 'open', vendorsInvited: [], createdBy: 'EMP-013' })
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
        await procurementApi.rfqs.create(values)
        toast.success('RFQ created successfully')
      } else {
        await procurementApi.rfqs.update(drawer.record.id, values)
        toast.success('RFQ updated successfully')
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
      await procurementApi.rfqs.remove(confirm.record.id)
      toast.success('RFQ deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'item', header: 'Item' },
    { key: 'project', header: 'Project', render: (r) => getProjectName(r.project) },
    { key: 'vendorsInvited', header: 'Vendors Invited', render: (r) => r.vendorsInvited?.map(getVendorName).join(', ') || '—' },
    { key: 'dueDate', header: 'Due Date', sortable: true, render: (r) => formatDate(r.dueDate) },
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
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <ProcurementWorkflowBanner current="RFQ" />
      </div>
      <PageHeader
        title="Request for Quotation"
        subtitle={`${table.total} RFQs sent to vendors`}
        actions={allowCreate && <Button icon={Plus} onClick={openCreate}>New RFQ</Button>}
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
            emptyState={{ title: 'No RFQs found', description: 'Create an RFQ to invite vendors for quotations.', action: allowCreate ? { label: 'New RFQ', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => procurementApi.rfqs.remove(id))); toast.success(`${ids.length} RFQ(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search RFQs…" className="w-full max-w-xs" />
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[150px]">
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="quotes-received">Quotes Received</option>
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New RFQ' : 'Edit RFQ'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Create RFQ' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Project" required error={errors.project?.message}>
            <Select {...register('project', { required: 'Project is required' })}>
              <option value="">Select project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Item / Package" required error={errors.item?.message}>
            <Input {...register('item', { required: 'Item is required' })} placeholder="e.g. Toughened Glass 12mm - Facade Package" />
          </Field>
          <Field label="Due Date" required error={errors.dueDate?.message}>
            <Input type="date" {...register('dueDate', { required: 'Due date is required' })} />
          </Field>
          <Field label="Vendors to Invite" required>
            <Controller
              name="vendorsInvited"
              control={control}
              rules={{ validate: (v) => (v && v.length > 0) || 'Select at least one vendor' }}
              render={({ field }) => (
                <MultiSelect options={vendors.map((v) => ({ value: v.id, label: v.name }))} value={field.value || []} onChange={field.onChange} placeholder="Select vendors…" />
              )}
            />
            {errors.vendorsInvited && <p className="mt-1 text-xs text-red-500">{errors.vendorsInvited.message}</p>}
          </Field>
          <Field label="Status">
            <Select {...register('status')}>
              <option value="open">Open</option>
              <option value="quotes-received">Quotes Received</option>
            </Select>
          </Field>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this RFQ?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
