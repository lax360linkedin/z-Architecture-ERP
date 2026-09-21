import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, MoreHorizontal, Send } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input, Textarea } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { useDataTable } from '../../hooks/useDataTable'
import { helpdeskApi } from '../../api/helpdeskApi'
import { ticketStatuses } from '../../data/helpdesk'
import { getCustomerName, customers } from '../../data/customers'
import { getEmployeeName, employees } from '../../data/employees'
import { getProjectName, projects } from '../../data/projects'
import { formatDate, formatRelativeTime, classNames } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'

const priorityColor = { low: 'neutral', medium: 'warning', high: 'danger' }
const ticketPriorities = ['low', 'medium', 'high']

export function resolveSender(from) {
  if (!from) return 'Unknown'
  return from.startsWith('EMP-') ? getEmployeeName(from) : getCustomerName(from)
}

export function TicketConversation({ ticket, onSent }) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  async function send() {
    if (!text.trim()) return
    setSending(true)
    try {
      const updated = await helpdeskApi.addMessage(ticket.id, { from: user?.id || 'EMP-002', text: text.trim() })
      setText('')
      onSent(updated)
    } catch (err) {
      toast.error(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-h-80 flex-col gap-2.5 overflow-y-auto rounded-lg border border-border bg-surface-subtle p-3">
        {ticket.messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-faint">No messages yet.</p>
        ) : (
          ticket.messages.map((m, i) => {
            const isStaff = m.from?.startsWith('EMP-')
            return (
              <div key={i} className={classNames('flex flex-col gap-1', isStaff ? 'items-end' : 'items-start')}>
                <div
                  className={classNames(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                    isStaff ? 'bg-brand-600 text-white' : 'border border-border bg-surface-raised text-ink'
                  )}
                >
                  {m.text}
                </div>
                <span className="px-1 text-[11px] text-ink-faint">{resolveSender(m.from)} · {formatRelativeTime(m.time)}</span>
              </div>
            )
          })
        )}
      </div>
      <div className="flex items-end gap-2">
        <Textarea
          rows={2}
          placeholder="Type a reply…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          className="flex-1"
        />
        <Button icon={Send} loading={sending} onClick={send}>Send</Button>
      </div>
    </div>
  )
}

export default function Tickets() {
  const { can } = usePermissions()
  const allowCreate = can('helpdesk', 'create')
  const allowEdit = can('helpdesk', 'edit')
  const allowDelete = can('helpdesk', 'delete')
  const table = useDataTable(helpdeskApi.tickets.list, { pageSize: 8, initialFilters: { status: 'all', priority: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [detail, setDetail] = useState(null)
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ customer: customers[0]?.id || '', project: '', subject: '', priority: 'medium', assignedTo: employees[0]?.id || '' })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset({ ...record, project: record.project || '' })
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, project: values.project || null }
      if (drawer.mode === 'create') {
        await helpdeskApi.tickets.create({ ...payload, status: 'Open', createdDate: new Date().toISOString().slice(0, 10), messages: [] })
        toast.success('Ticket created')
      } else {
        await helpdeskApi.tickets.update(drawer.record.id, payload)
        toast.success('Ticket updated')
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
      await helpdeskApi.tickets.remove(confirm.record.id)
      toast.success('Ticket deleted')
      setConfirm({ open: false, record: null })
      setDetail(null)
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(status) {
    const updated = await helpdeskApi.tickets.update(detail.id, { status })
    setDetail(updated)
    toast.success(`Ticket marked as ${status}`)
    table.refresh()
  }

  const columns = [
    { key: 'id', header: 'Ticket ID', render: (t) => <span className="font-medium text-ink">{t.id}</span> },
    { key: 'customer', header: 'Customer', render: (t) => getCustomerName(t.customer) },
    { key: 'subject', header: 'Subject', sortable: true, render: (t) => <span className="line-clamp-1">{t.subject}</span> },
    { key: 'priority', header: 'Priority', render: (t) => <Badge color={priorityColor[t.priority] || 'neutral'}>{t.priority}</Badge> },
    { key: 'assignedTo', header: 'Assigned To', render: (t) => getEmployeeName(t.assignedTo) },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'createdDate', header: 'Created Date', sortable: true, render: (t) => formatDate(t.createdDate) },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (t) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-44" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(t)}>Edit</DropdownItem>}
                {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: t })}>Delete</DropdownItem>}
              </Dropdown>
            </div>
          ),
        }]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Tickets"
        subtitle={`${table.total} support tickets`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Ticket</Button> : null}
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
            onRowClick={(t) => setDetail(t)}
            page={table.page}
            pageSize={table.pageSize}
            total={table.total}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
            emptyState={{ title: 'No tickets found', description: 'Create your first support ticket.', action: allowCreate ? { label: 'New Ticket', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => helpdeskApi.tickets.remove(id))); toast.success(`${ids.length} ticket(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search tickets…" className="w-full max-w-xs" />
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Status</option>
                  {ticketStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Select value={table.filters.priority} onChange={(e) => table.setFilters((p) => ({ ...p, priority: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Priority</option>
                  {ticketPriorities.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      {/* Create / Edit Drawer */}
      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Ticket' : 'Edit Ticket'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Create Ticket' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Customer">
            <Select {...register('customer')}>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Project (optional)">
            <Select {...register('project')}>
              <option value="">No project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Subject" required error={errors.subject?.message}>
            <Input {...register('subject', { required: 'Subject is required' })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority">
              <Select {...register('priority')}>
                {ticketPriorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="Assigned To">
              <Select {...register('assignedTo')}>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
          </div>
        </form>
      </Drawer>

      {/* Detail Drawer */}
      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.subject} description={detail ? `${detail.id} · ${getCustomerName(detail.customer)}` : ''} size="lg">
        {detail && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <Field label="Status" className="w-44">
                <Select value={detail.status} onChange={(e) => changeStatus(e.target.value)}>
                  {ticketStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
              <Badge color={priorityColor[detail.priority] || 'neutral'}>{detail.priority} priority</Badge>
              {detail.project && <Badge>{getProjectName(detail.project)}</Badge>}
              <span className="text-xs text-ink-faint">Assigned to {getEmployeeName(detail.assignedTo)}</span>
            </div>
            <TicketConversation ticket={detail} onSent={setDetail} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this ticket?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
