import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Calendar, Clock, MapPin, Pencil, Trash2, MoreHorizontal, ListChecks, FileText } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input, Textarea } from '../../components/ui/Input'
import { MultiSelect } from '../../components/ui/MultiSelect'
import { Drawer } from '../../components/ui/Drawer'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown'
import { Pills } from '../../components/ui/Tabs'
import { StatusBadge } from '../../components/ui/Badge'
import { AvatarGroup } from '../../components/ui/Avatar'
import { Pagination } from '../../components/ui/Pagination'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { useDataTable } from '../../hooks/useDataTable'
import { meetingApi } from '../../api/collaborationApi'
import { getProjectName, projects } from '../../data/projects'
import { getEmployeeName, employees } from '../../data/employees'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function Meetings() {
  const { can } = usePermissions()
  const allowCreate = can('meetings', 'create')
  const allowEdit = can('meetings', 'edit')
  const allowDelete = can('meetings', 'delete')
  const table = useDataTable(meetingApi.list, { pageSize: 6, initialFilters: { status: 'all' } })
  const [drawer, setDrawer] = useState({ open: false, mode: 'create', record: null })
  const [confirm, setConfirm] = useState({ open: false, record: null })
  const [detail, setDetail] = useState(null)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [participants, setParticipants] = useState([])

  function openCreate() {
    reset({ title: '', project: '', date: '', time: '', duration: '1h', organizer: 'EMP-002', location: '', agenda: '' })
    setParticipants([])
    setDrawer({ open: true, mode: 'create', record: null })
  }
  function openEdit(record) {
    reset({ ...record, agenda: (record.agenda || []).join('\n') })
    setParticipants(record.participants || [])
    setDrawer({ open: true, mode: 'edit', record })
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = {
        ...values,
        project: values.project || null,
        participants,
        agenda: values.agenda.split('\n').map((s) => s.trim()).filter(Boolean),
      }
      if (drawer.mode === 'create') {
        await meetingApi.create({ ...payload, minutes: null, actionItems: [], status: 'scheduled' })
        toast.success('Meeting scheduled')
      } else {
        await meetingApi.update(drawer.record.id, payload)
        toast.success('Meeting updated')
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
      await meetingApi.remove(confirm.record.id)
      toast.success('Meeting deleted')
      setConfirm({ open: false, record: null })
      setDetail(null)
      table.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Meetings"
        subtitle={`${table.total} meetings`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>Schedule Meeting</Button> : null}
      />
      <PageBody>
        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
            <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search meetings…" className="w-full max-w-xs" />
            <Pills
              value={table.filters.status}
              onChange={(v) => table.setFilters((p) => ({ ...p, status: v }))}
              options={[{ value: 'all', label: 'All' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'completed', label: 'Completed' }]}
            />
          </div>

          <div className="p-4">
            {table.loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : table.items.length === 0 ? (
              <EmptyState title="No meetings found" description="Schedule your first meeting to get started." action={allowCreate ? { label: 'Schedule Meeting', icon: Plus, onClick: openCreate } : undefined} />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {table.items.map((m) => (
                  <Card key={m.id} className="flex cursor-pointer flex-col gap-3" onClick={() => setDetail(m)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{m.title}</p>
                        <p className="text-xs text-ink-faint">{m.project ? getProjectName(m.project) : 'Internal'}</p>
                      </div>
                      {(allowEdit || allowDelete) && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Dropdown align="right" width="w-44" trigger={<button className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-surface-subtle hover:text-ink"><MoreHorizontal className="h-4 w-4" /></button>}>
                            {allowEdit && <DropdownItem icon={Pencil} onClick={() => openEdit(m)}>Edit</DropdownItem>}
                            {allowDelete && <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ open: true, record: m })}>Delete</DropdownItem>}
                          </Dropdown>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs text-ink-muted">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(m.date)}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{m.time} · {m.duration}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{m.location}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                      <div>
                        <p className="text-[11px] text-ink-faint">Organizer</p>
                        <p className="text-xs font-medium text-ink">{getEmployeeName(m.organizer)}</p>
                      </div>
                      <AvatarGroup names={(m.participants || []).map(getEmployeeName)} size="xs" />
                    </div>
                    <StatusBadge status={m.status} />
                  </Card>
                ))}
              </div>
            )}
          </div>
          {!table.loading && table.items.length > 0 && (
            <Pagination page={table.page} pageSize={table.pageSize} total={table.total} totalPages={table.totalPages} onPageChange={table.setPage} />
          )}
        </Card>
      </PageBody>

      {/* Schedule / Edit Drawer */}
      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, mode: 'create', record: null })}
        title={drawer.mode === 'create' ? 'Schedule Meeting' : 'Edit Meeting'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer({ open: false, mode: 'create', record: null })}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>{drawer.mode === 'create' ? 'Schedule' : 'Save changes'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Title" required error={errors.title?.message}>
            <Input {...register('title', { required: 'Title is required' })} />
          </Field>
          <Field label="Project (optional)">
            <Select {...register('project')}>
              <option value="">Internal</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Date" required error={errors.date?.message}><Input type="date" {...register('date', { required: 'Required' })} /></Field>
            <Field label="Time" required error={errors.time?.message}><Input placeholder="e.g. 11:00 AM" {...register('time', { required: 'Required' })} /></Field>
            <Field label="Duration"><Input placeholder="e.g. 1h" {...register('duration')} /></Field>
          </div>
          <Field label="Organizer">
            <Select {...register('organizer')}>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
          </Field>
          <Field label="Participants">
            <MultiSelect
              options={employees.map((e) => ({ value: e.id, label: e.name }))}
              value={participants}
              onChange={setParticipants}
              placeholder="Select participants…"
            />
          </Field>
          <Field label="Location">
            <Input placeholder="Room / Google Meet link" {...register('location')} />
          </Field>
          <Field label="Agenda" hint="One agenda item per line">
            <Textarea rows={4} placeholder={'Review roof deck layout\nDiscuss pool access design'} {...register('agenda')} />
          </Field>
        </form>
      </Drawer>

      {/* Detail Drawer */}
      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.title} description={detail ? (detail.project ? getProjectName(detail.project) : 'Internal') : ''} size="lg">
        {detail && <MeetingDetail key={detail.id} meeting={detail} allowEdit={allowEdit} onUpdated={(updated) => { setDetail(updated); table.refresh() }} />}
      </Drawer>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, record: null })}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete this meeting?"
        description="This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}

function MeetingDetail({ meeting, allowEdit, onUpdated }) {
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { minutes: meeting.minutes || '', actionItems: (meeting.actionItems || []).join('\n') },
  })

  async function onLogMinutes(values) {
    setSaving(true)
    try {
      const payload = {
        minutes: values.minutes,
        actionItems: values.actionItems.split('\n').map((s) => s.trim()).filter(Boolean),
        status: 'completed',
      }
      const updated = await meetingApi.update(meeting.id, payload)
      toast.success('Minutes logged and meeting marked completed')
      onUpdated({ ...meeting, ...updated })
    } catch (err) {
      toast.error(err.message || 'Failed to save minutes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted">
        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(meeting.date)}</span>
        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{meeting.time} · {meeting.duration}</span>
        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{meeting.location}</span>
        <StatusBadge status={meeting.status} />
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-ink-muted">Organizer</p>
        <p className="text-sm text-ink">{getEmployeeName(meeting.organizer)}</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-ink-muted">Participants</p>
        <div className="flex flex-wrap gap-1.5">
          {(meeting.participants || []).map((p) => (
            <span key={p} className="rounded-md bg-surface-subtle px-2 py-1 text-xs text-ink">{getEmployeeName(p)}</span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-muted"><ListChecks className="h-3.5 w-3.5" /> Agenda</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
          {(meeting.agenda || []).map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>

      {meeting.status === 'completed' ? (
        <>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-muted"><FileText className="h-3.5 w-3.5" /> Minutes</p>
            <p className="whitespace-pre-line rounded-lg border border-border bg-surface-subtle p-3 text-sm text-ink">{meeting.minutes || '—'}</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-ink-muted">Action Items</p>
            {(meeting.actionItems || []).length === 0 ? (
              <p className="text-sm text-ink-faint">No action items recorded.</p>
            ) : (
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
                {meeting.actionItems.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            )}
          </div>
        </>
      ) : allowEdit ? (
        <form onSubmit={handleSubmit(onLogMinutes)} className="flex flex-col gap-3 border-t border-border pt-4">
          <p className="text-xs font-medium text-ink-muted">Log Minutes</p>
          <Field label="Minutes" required error={errors.minutes?.message}>
            <Textarea rows={4} placeholder="Summarize what was discussed…" {...register('minutes', { required: 'Minutes are required' })} />
          </Field>
          <Field label="Action Items" hint="One action item per line">
            <Textarea rows={3} placeholder={'Yash to follow up with client by Sep 20'} {...register('actionItems')} />
          </Field>
          <Button type="submit" loading={saving} className="self-end">Save Minutes &amp; Complete</Button>
        </form>
      ) : (
        <p className="border-t border-border pt-4 text-sm text-ink-faint">Minutes have not been logged yet.</p>
      )}
    </div>
  )
}
