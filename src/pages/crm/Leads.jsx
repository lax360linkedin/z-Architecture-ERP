import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, LayoutGrid, List as ListIcon, ArrowRightCircle, Pencil, Trash2, Phone, Mail } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input, Textarea } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Pills } from '../../components/ui/Tabs'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { MoreHorizontal } from 'lucide-react'
import { EmptyState } from '../../components/ui/EmptyState'
import { useDataTable } from '../../hooks/useDataTable'
import { crmApi } from '../../api/crmApi'
import { leadSources, leadStatuses } from '../../data/leads'
import { getEmployeeName, employees } from '../../data/employees'
import { formatCurrency, formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function Leads() {
  const { can } = usePermissions()
  const allowCreate = can('crm', 'create')
  const allowEdit = can('crm', 'edit')
  const allowDelete = can('crm', 'delete')
  const table = useDataTable(crmApi.leads.list, { pageSize: 8, initialFilters: { status: 'all', source: 'all' } })
  const [view, setView] = useState('table')
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ status: 'new', source: 'Website', owner: 'EMP-018' })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset(record)
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, value: Number(values.value) || 0, createdDate: values.createdDate || new Date().toISOString().slice(0, 10) }
      if (drawer.mode === 'create') {
        await crmApi.leads.create(payload)
        toast.success('Lead created successfully')
      } else {
        await crmApi.leads.update(drawer.record.id, payload)
        toast.success('Lead updated successfully')
      }
      setDrawer({ open: false, mode: 'create', record: null })
      table.refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleConvert(lead) {
    try {
      await crmApi.convertLead(lead.id)
      toast.success(`${lead.name} converted to a customer`)
      table.refresh()
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await crmApi.leads.remove(confirm.record.id)
      toast.success('Lead deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'name', header: 'Lead', sortable: true, render: (l) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={l.name} size="sm" />
          <div>
            <p className="font-medium text-ink">{l.name}</p>
            {l.company && <p className="text-xs text-ink-faint">{l.company}</p>}
          </div>
        </div>
      ),
    },
    { key: 'source', header: 'Source', render: (l) => <Badge>{l.source}</Badge> },
    { key: 'value', header: 'Value', sortable: true, render: (l) => formatCurrency(l.value, { compact: true }) },
    { key: 'owner', header: 'Owner', render: (l) => getEmployeeName(l.owner) },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} /> },
    { key: 'lastContact', header: 'Last Contact', render: (l) => formatDate(l.lastContact) },
    { key: 'nextFollowUp', header: 'Next Follow-up', render: (l) => (l.nextFollowUp ? formatDate(l.nextFollowUp) : '—') },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (l) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-48" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(l)}>Edit</DropdownItem>}
                {allowEdit && l.status !== 'converted' && (
                  <DropdownItem icon={ArrowRightCircle} onClick={() => handleConvert(l)}>Convert to Customer</DropdownItem>
                )}
                {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: l })}>Delete</DropdownItem>}
              </Dropdown>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${table.total} leads in your pipeline`}
        actions={
          <>
            <Pills value={view} onChange={setView} options={[{ value: 'table', label: 'Table' }, { value: 'card', label: 'Cards' }]} />
            {allowCreate && <Button icon={Plus} onClick={openCreate}>New Lead</Button>}
          </>
        }
      />
      <PageBody>
        {view === 'table' ? (
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
              emptyState={{ title: 'No leads found', description: 'Create your first lead to start building your pipeline.', action: allowCreate ? { label: 'New Lead', icon: Plus, onClick: openCreate } : undefined }}
              bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => crmApi.leads.remove(id))); toast.success(`${ids.length} lead(s) deleted`); setSelected([]); table.refresh() } }] : []}
              toolbar={
                <>
                  <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search leads…" className="w-full max-w-xs" />
                  <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[130px]">
                    <option value="all">All Status</option>
                    {leadStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                  <Select value={table.filters.source} onChange={(e) => table.setFilters((p) => ({ ...p, source: e.target.value }))} className="w-auto min-w-[130px]">
                    <option value="all">All Sources</option>
                    {leadSources.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </>
              }
            />
          </Card>
        ) : table.items.length === 0 && !table.loading ? (
          <Card><EmptyState title="No leads found" description="Create your first lead to start building your pipeline." action={allowCreate ? { label: 'New Lead', icon: Plus, onClick: openCreate } : undefined} /></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {table.items.map((l) => (
              <Card key={l.id} className={allowEdit ? 'flex cursor-pointer flex-col gap-3' : 'flex flex-col gap-3'} onClick={allowEdit ? () => openEdit(l) : undefined}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={l.name} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{l.name}</p>
                      {l.company && <p className="text-xs text-ink-faint">{l.company}</p>}
                    </div>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-muted">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{l.contact}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-ink-muted"><Mail className="h-3 w-3" />{l.email}</div>
                <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                  <span className="text-sm font-semibold text-ink">{formatCurrency(l.value, { compact: true })}</span>
                  <Badge>{l.source}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Lead' : 'Edit Lead'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Create Lead' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Full name / Contact person" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Name is required' })} />
          </Field>
          <Field label="Company (optional)">
            <Input {...register('company')} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" required error={errors.contact?.message}>
              <Input {...register('contact', { required: 'Phone is required' })} />
            </Field>
            <Field label="Email" required error={errors.email?.message}>
              <Input type="email" {...register('email', { required: 'Email is required' })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <Input {...register('city')} />
            </Field>
            <Field label="Project Type">
              <Input {...register('projectType')} placeholder="Residential, Commercial…" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estimated Value (₹)">
              <Input type="number" {...register('value')} />
            </Field>
            <Field label="Source">
              <Select {...register('source')}>
                {leadSources.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select {...register('status')}>
                {leadStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Owner">
              <Select {...register('owner')}>
                {employees.filter((e) => ['Sales Manager', 'Employee'].includes(e.role)).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Next Follow-up">
            <Input type="date" {...register('nextFollowUp')} />
          </Field>
          <Field label="Notes">
            <Textarea {...register('notes')} placeholder="Add context about this lead…" />
          </Field>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this lead?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
