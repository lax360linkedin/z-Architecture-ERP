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
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { useDataTable } from '../../hooks/useDataTable'
import { siteApi } from '../../api/siteApi'
import { getEmployeeName, employees } from '../../data/employees'
import { getProjectName, projects } from '../../data/projects'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'
import { useAuth } from '../../context/AuthContext'
import { logAudit } from '../../api/auditLogApi'

const severityColor = { low: 'neutral', medium: 'warning', high: 'danger' }

export default function SiteIssues() {
  const { user } = useAuth()
  const { can } = usePermissions()
  const allowCreate = can('site', 'create')
  const allowEdit = can('site', 'edit')
  const allowDelete = can('site', 'delete')
  const table = useDataTable(siteApi.issues.list, { pageSize: 8, initialFilters: { severity: 'all', status: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ project: projects[0]?.id, title: '', severity: 'medium', raisedBy: employees[0]?.id, date: new Date().toISOString().slice(0, 10), status: 'open' })
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
        await siteApi.issues.create(values)
        toast.success('Issue raised')
      } else {
        await siteApi.issues.update(drawer.record.id, values)
        toast.success('Issue updated')
      }
      setDrawer({ open: false, mode: 'create', record: null })
      table.refresh()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function resolveIssue(issue) {
    await siteApi.issues.update(issue.id, { status: 'resolved' })
    logAudit({ user, action: 'Resolved site issue', module: 'Site Management', record: issue.id, change: 'status: open → resolved' })
    toast.success('Issue marked resolved')
    table.refresh()
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await siteApi.issues.remove(confirm.record.id)
      toast.success('Issue deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'project', header: 'Project', render: (i) => getProjectName(i.project) },
    { key: 'title', header: 'Title', render: (i) => <span className="line-clamp-1">{i.title}</span> },
    { key: 'severity', header: 'Severity', render: (i) => <Badge color={severityColor[i.severity]}>{i.severity}</Badge> },
    { key: 'raisedBy', header: 'Raised By', render: (i) => getEmployeeName(i.raisedBy) },
    { key: 'date', header: 'Date', sortable: true, render: (i) => formatDate(i.date) },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    ...(allowEdit || allowDelete
      ? [{
          key: '__actions', header: '', className: 'text-right', render: (i) => (
            <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
              <Dropdown align="right" width="w-44" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                {allowEdit && i.status === 'open' && <DropdownItem icon={CheckCircle2} onClick={() => resolveIssue(i)}>Resolve</DropdownItem>}
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
        title="Site Issues"
        subtitle={`${table.total} issues tracked`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>Raise Issue</Button> : null}
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
            emptyState={{ title: 'No issues found', description: 'Raise a site issue to track it here.', action: allowCreate ? { label: 'Raise Issue', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => siteApi.issues.remove(id))); toast.success(`${ids.length} issue(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={
              <>
                <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search issues…" className="w-full max-w-xs" />
                <Select value={table.filters.severity} onChange={(e) => table.setFilters((p) => ({ ...p, severity: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
                <Select value={table.filters.status} onChange={(e) => table.setFilters((p) => ({ ...p, status: e.target.value }))} className="w-auto min-w-[130px]">
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                </Select>
              </>
            }
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'Raise Issue' : 'Edit Issue'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Raise Issue' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Project">
            <Select {...register('project')}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Title" required error={errors.title?.message}>
            <Input {...register('title', { required: 'Required' })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Severity">
              <Select {...register('severity')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </Field>
            <Field label="Raised By">
              <Select {...register('raisedBy')}>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <Input type="date" {...register('date')} />
            </Field>
            <Field label="Status">
              <Select {...register('status')}>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </Select>
            </Field>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this issue?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
