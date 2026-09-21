import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Trash2, Pencil, Eye, MoreHorizontal, CloudSun, Users, Camera } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Field, Input, Select, Textarea } from '../../components/ui/Input'
import { DataTable } from '../../components/ui/DataTable'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Badge } from '../../components/ui/Badge'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { useDataTable } from '../../hooks/useDataTable'
import { siteApi } from '../../api/siteApi'
import { getEmployeeName, employees } from '../../data/employees'
import { getProjectName, projects } from '../../data/projects'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function DailyReports() {
  const { can } = usePermissions()
  const allowCreate = can('site', 'create')
  const allowEdit = can('site', 'edit')
  const allowDelete = can('site', 'delete')
  const table = useDataTable(siteApi.reports.list, { pageSize: 8 })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [detail, setDetail] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  function openCreate() {
    reset({ project: projects[0]?.id, site: '', engineer: employees[0]?.id, date: new Date().toISOString().slice(0, 10), weather: 'Clear', labourCount: 0, workCompleted: '', materials: '', issues: '', remarks: '', photos: 0 })
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset(record)
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = { ...values, labourCount: Number(values.labourCount) || 0, photos: Number(values.photos) || 0 }
      if (drawer.mode === 'create') {
        await siteApi.reports.create(payload)
        toast.success('Daily report submitted')
      } else {
        await siteApi.reports.update(drawer.record.id, payload)
        toast.success('Report updated')
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
      await siteApi.reports.remove(confirm.record.id)
      toast.success('Report deleted')
      setConfirm({ open: false, record: null })
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'project', header: 'Project', render: (r) => getProjectName(r.project) },
    { key: 'site', header: 'Site', render: (r) => <span className="text-ink-muted">{r.site}</span> },
    { key: 'engineer', header: 'Engineer', render: (r) => getEmployeeName(r.engineer) },
    { key: 'date', header: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    { key: 'weather', header: 'Weather', render: (r) => <Badge>{r.weather}</Badge> },
    { key: 'labourCount', header: 'Labour', sortable: true, render: (r) => r.labourCount },
    { key: 'photos', header: 'Photos', render: (r) => <span className="flex items-center gap-1"><Camera className="h-3.5 w-3.5 text-ink-faint" />{r.photos}</span> },
    { key: 'status', header: 'Status', render: () => <Badge color="success">Submitted</Badge> },
    {
      key: '__actions', header: '', className: 'text-right', render: (r) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <Dropdown align="right" width="w-44" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
            <DropdownItem icon={Eye} onClick={() => setDetail(r)}>View details</DropdownItem>
            {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(r)}>Edit</DropdownItem>}
            {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: r })}>Delete</DropdownItem>}
          </Dropdown>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Daily Reports"
        subtitle={`${table.total} site reports submitted`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Report</Button> : null}
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
            onRowClick={(r) => setDetail(r)}
            page={table.page}
            pageSize={table.pageSize}
            total={table.total}
            totalPages={table.totalPages}
            onPageChange={table.setPage}
            emptyState={{ title: 'No site reports found', description: 'Submit your first daily report to get started.', action: allowCreate ? { label: 'New Report', icon: Plus, onClick: openCreate } : undefined }}
            bulkActions={allowDelete ? [{ label: 'Delete', icon: Trash2, onClick: async (ids) => { await Promise.all(ids.map((id) => siteApi.reports.remove(id))); toast.success(`${ids.length} report(s) deleted`); setSelected([]); table.refresh() } }] : []}
            toolbar={<SearchInput value={table.query} onChange={table.setQuery} placeholder="Search reports…" className="w-full max-w-xs" />}
          />
        </Card>
      </PageBody>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'New Daily Report' : 'Edit Daily Report'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Submit Report' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Project">
              <Select {...register('project')}>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <Field label="Site" required error={errors.site?.message}>
              <Input {...register('site', { required: 'Required' })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Engineer">
              <Select {...register('engineer')}>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" {...register('date')} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Weather">
              <Input {...register('weather')} placeholder="Clear, Overcast, Rain…" />
            </Field>
            <Field label="Labour Count">
              <Input type="number" min="0" {...register('labourCount')} />
            </Field>
            <Field label="Photos">
              <Input type="number" min="0" {...register('photos')} />
            </Field>
          </div>
          <Field label="Work Completed">
            <Textarea {...register('workCompleted')} placeholder="Summary of today's progress…" />
          </Field>
          <Field label="Materials Received">
            <Textarea {...register('materials')} placeholder="Materials delivered on site…" />
          </Field>
          <Field label="Issues">
            <Textarea {...register('issues')} placeholder="Any delays, blockers or safety issues…" />
          </Field>
          <Field label="Remarks">
            <Textarea {...register('remarks')} placeholder="Additional remarks…" />
          </Field>
        </form>
      </Drawer>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail ? `${getProjectName(detail.project)} — ${formatDate(detail.date)}` : ''} size="lg">
        {detail && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div><p className="text-xs text-ink-faint">Site</p><p className="mt-0.5 font-medium text-ink">{detail.site}</p></div>
              <div><p className="text-xs text-ink-faint">Engineer</p><p className="mt-0.5 font-medium text-ink">{getEmployeeName(detail.engineer)}</p></div>
              <div><p className="text-xs text-ink-faint">Weather</p><p className="mt-0.5 flex items-center gap-1 font-medium text-ink"><CloudSun className="h-4 w-4" />{detail.weather}</p></div>
              <div><p className="text-xs text-ink-faint">Labour Count</p><p className="mt-0.5 flex items-center gap-1 font-medium text-ink"><Users className="h-4 w-4" />{detail.labourCount}</p></div>
              <div><p className="text-xs text-ink-faint">Photos</p><p className="mt-0.5 flex items-center gap-1 font-medium text-ink"><Camera className="h-4 w-4" />{detail.photos}</p></div>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Work Completed</p>
              <p className="text-sm text-ink">{detail.workCompleted || '—'}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Materials Received</p>
              <p className="text-sm text-ink">{detail.materials || '—'}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Issues</p>
              <p className="text-sm text-ink">{detail.issues || 'None'}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Remarks</p>
              <p className="text-sm text-ink">{detail.remarks || '—'}</p>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this report?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
