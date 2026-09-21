import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Square, CheckSquare, Paperclip, Send, Clock3, IndianRupee,
  FolderKanban, Ruler, FileText, CheckCircle2, XCircle, UserCog, Link2, Trash2,
} from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { PageLoader } from '../../components/layout/PageLoader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Timeline } from '../../components/ui/Timeline'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { Drawer } from '../../components/ui/Drawer'
import { Field, Input, Select, Textarea } from '../../components/ui/Input'
import { FileUpload } from '../../components/ui/FileUpload'
import { taskApi, isTaskReady } from '../../api/taskApi'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'
import { employees, getEmployeeName } from '../../data/employees'
import { getProjectName, getProjectById } from '../../data/projects'
import { getDrawingById } from '../../data/drawings'
import { TASK_STATUSES, TASK_PRIORITIES } from '../../data/tasks'
import { formatDate, formatRelativeTime, classNames } from '../../utils/format'

const priorityColor = { Low: 'neutral', Medium: 'info', High: 'warning', Critical: 'danger' }

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { can, canAccessTask } = usePermissions()

  const [loading, setLoading] = useState(true)
  const [t, setT] = useState(null)
  const [subtasks, setSubtasks] = useState([])
  const [parentProgress, setParentProgress] = useState(null)
  const [comment, setComment] = useState('')
  const [logTimeOpen, setLogTimeOpen] = useState(false)
  const [reassignOpen, setReassignOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset } = useForm({ defaultValues: { hours: '', billable: true, description: '' } })
  const { register: registerReassign, handleSubmit: handleReassignSubmit } = useForm()

  async function load() {
    setLoading(true)
    const record = await taskApi.get(id)
    if (!record) {
      setT(null)
      setLoading(false)
      return
    }
    const [subs, prog] = await Promise.all([taskApi.subtasksOf(id), taskApi.parentProgress(id)])
    setT(record)
    setSubtasks(subs)
    setParentProgress(prog)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <PageLoader />

  if (!t) {
    return (
      <div>
        <PageHeader title="Task not found" actions={<Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/tasks/list')}>Back</Button>} />
        <PageBody><EmptyState title="This task doesn't exist" description="It may have been removed or the link is incorrect." /></PageBody>
      </div>
    )
  }

  if (!canAccessTask(t)) {
    navigate('/unauthorized', { state: { from: `/tasks/${id}` }, replace: true })
    return null
  }

  const allowEdit = can('tasks', 'edit')
  const allowAssign = can('tasks', 'assign') || can('tasks', 'reassign')
  const allowApprove = can('tasks', 'approve')
  const allowComplete = can('tasks', 'complete')
  const allowComment = can('tasks', 'comment')
  const allowUpload = can('tasks', 'upload')
  const allowDelete = can('tasks', 'delete')
  const allowDependencies = can('tasks', 'manage_dependencies')

  const ready = isTaskReady(t)
  const checklistDone = (t.checklist || []).filter((c) => c.done).length
  const checklistPct = t.checklist?.length ? Math.round((checklistDone / t.checklist.length) * 100) : null
  const project = t.project ? getProjectById(t.project) : null
  const drawing = t.relatedDrawing ? getDrawingById(t.relatedDrawing) : null

  async function changeStatus(status) {
    await taskApi.changeStatus(t.id, status, user)
    toast.success(`Task moved to ${status}`)
    load()
  }

  async function handleApprove(approve) {
    await taskApi.approve(t.id, approve, user)
    toast.success(approve ? 'Task approved' : 'Task sent back for rework')
    load()
  }

  async function toggleChecklist(itemId) {
    await taskApi.toggleChecklistItem(t.id, itemId, user)
    load()
  }

  async function submitComment() {
    if (!comment.trim()) return
    await taskApi.addComment(t.id, comment.trim(), user)
    setComment('')
    load()
  }

  async function onLogTime(values) {
    setSaving(true)
    try {
      await taskApi.logTime({ taskId: t.id, employeeId: user.employeeId, date: new Date().toISOString().slice(0, 10), hours: Number(values.hours), billable: values.billable, description: values.description }, user)
      toast.success(`${values.hours}h logged against this task`)
      setLogTimeOpen(false)
      reset()
      load()
    } finally {
      setSaving(false)
    }
  }

  async function onReassign(values) {
    setSaving(true)
    try {
      await taskApi.reassign(t.id, values.assignedTo, user)
      toast.success('Task reassigned')
      setReassignOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function onUploadFiles(files) {
    for (const f of files) {
      // eslint-disable-next-line no-await-in-loop
      await taskApi.addAttachment(t.id, f, user)
    }
    load()
  }

  async function confirmDelete() {
    if (!window.confirm('Delete this task? This cannot be undone.')) return
    await taskApi.remove(t.id, user)
    toast.success('Task deleted')
    navigate('/tasks/list')
  }

  return (
    <div>
      <PageHeader
        title={
          <button onClick={() => navigate('/tasks/list')} className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> All Tasks
          </button>
        }
        subtitle={null}
        className="pb-0"
      />
      <div className="border-b border-border bg-surface-raised px-4 pb-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-ink font-[Inter_Tight]">{t.title}</h1>
              <Badge color="brand">{t.id}</Badge>
              <StatusBadge status={t.status} />
              <Badge color={priorityColor[t.priority]}>{t.priority}</Badge>
              {!ready && <Badge color="danger">Blocked by dependency</Badge>}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
              <Badge>{t.type}</Badge>
              {project && <button onClick={() => navigate(`/projects/${project.id}`)} className="flex items-center gap-1 hover:text-brand-600"><FolderKanban className="h-3.5 w-3.5" />{project.name}</button>}
              <span className="flex items-center gap-1"><Avatar name={getEmployeeName(t.assignedTo)} size="xs" />{t.assignedTo ? getEmployeeName(t.assignedTo) : 'Unassigned'}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {allowAssign && <Button size="sm" variant="secondary" icon={UserCog} onClick={() => setReassignOpen(true)}>Reassign</Button>}
            {allowUpload && <Button size="sm" variant="secondary" icon={Paperclip} onClick={() => document.getElementById('task-detail-upload')?.click()}>Attach</Button>}
            {(allowEdit || allowComplete) && <Button size="sm" variant="secondary" icon={Clock3} onClick={() => setLogTimeOpen(true)}>Log Time</Button>}
            {allowDelete && <Button size="sm" variant="ghost" icon={Trash2} onClick={confirmDelete}>Delete</Button>}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {TASK_STATUSES.filter((s) => !['Cancelled'].includes(s)).map((s) => (
            <button
              key={s}
              disabled={!allowEdit && !allowComplete}
              onClick={() => changeStatus(s)}
              className={classNames(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                t.status === s ? 'border-brand-600 bg-brand-600 text-white' : 'border-border text-ink-muted hover:bg-surface-subtle',
                (!allowEdit && !allowComplete) && 'cursor-not-allowed opacity-50'
              )}
            >
              {s}
            </button>
          ))}
          {allowApprove && t.status === 'Review' && (
            <span className="ml-2 flex gap-1.5">
              <Button size="sm" icon={CheckCircle2} onClick={() => handleApprove(true)}>Approve</Button>
              <Button size="sm" variant="secondary" icon={XCircle} onClick={() => handleApprove(false)}>Reject</Button>
            </span>
          )}
        </div>
      </div>

      <PageBody className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="flex flex-col gap-5 xl:col-span-2">
          <Card>
            <CardHeader title="Overview" />
            <p className="text-sm text-ink-muted">{t.description || 'No description provided.'}</p>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border-subtle pt-4 text-sm sm:grid-cols-4">
              <div><p className="text-xs text-ink-faint">Start Date</p><p className="mt-0.5 font-medium text-ink">{formatDate(t.startDate)}</p></div>
              <div><p className="text-xs text-ink-faint">Due Date</p><p className="mt-0.5 font-medium text-ink">{formatDate(t.dueDate)}</p></div>
              <div><p className="text-xs text-ink-faint">Estimated Hours</p><p className="mt-0.5 font-medium text-ink">{t.estimatedHours}h</p></div>
              <div><p className="text-xs text-ink-faint">Actual Hours</p><p className="mt-0.5 font-medium text-ink">{t.actualHours}h</p></div>
              <div><p className="text-xs text-ink-faint">Created By</p><p className="mt-0.5 font-medium text-ink">{getEmployeeName(t.createdBy)}</p></div>
              <div><p className="text-xs text-ink-faint">Reviewer</p><p className="mt-0.5 font-medium text-ink">{t.reviewer ? getEmployeeName(t.reviewer) : '—'}</p></div>
              <div><p className="text-xs text-ink-faint">Department</p><p className="mt-0.5 font-medium text-ink">{t.assignedDepartment || '—'}</p></div>
              <div><p className="text-xs text-ink-faint">Approval</p><p className="mt-0.5 font-medium text-ink capitalize">{t.approvalStatus || 'Not submitted'}</p></div>
            </div>
            {t.estimatedHours > 0 && (
              <div className="mt-4 border-t border-border-subtle pt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs text-ink-muted">
                  <span>Effort progress</span><span>{t.actualHours}h / {t.estimatedHours}h</span>
                </div>
                <ProgressBar value={Math.min(100, (t.actualHours / t.estimatedHours) * 100)} color="auto" />
              </div>
            )}
            {t.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border-subtle pt-4">
                {t.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
              </div>
            )}
          </Card>

          {(t.checklist?.length > 0 || allowEdit) && (
            <Card>
              <CardHeader title="Checklist" subtitle={checklistPct != null ? `${checklistDone}/${t.checklist.length} complete — ${checklistPct}%` : 'No items yet'} />
              {checklistPct != null && <ProgressBar value={checklistPct} color="auto" className="mb-3" />}
              {t.checklist?.length === 0 ? (
                <EmptyState title="No checklist items" />
              ) : (
                <div className="flex flex-col gap-1.5">
                  {t.checklist.map((c) => (
                    <button key={c.id} onClick={() => (allowEdit || allowComplete) && toggleChecklist(c.id)} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-subtle">
                      {c.done ? <CheckSquare className="h-4 w-4 shrink-0 text-emerald-600" /> : <Square className="h-4 w-4 shrink-0 text-ink-faint" />}
                      <span className={classNames(c.done && 'text-ink-faint line-through')}>{c.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          )}

          {(subtasks.length > 0 || t.parentTask == null) && (
            <Card padded={false}>
              <CardHeader title="Subtasks" subtitle={parentProgress ? `${parentProgress.done}/${parentProgress.total} complete — ${parentProgress.percent}%` : `${subtasks.length} subtask(s)`} className="px-5 pt-5" />
              {parentProgress && <div className="px-5 pb-3"><ProgressBar value={parentProgress.percent} color="auto" /></div>}
              {subtasks.length === 0 ? (
                <div className="px-5 pb-5"><EmptyState title="No subtasks" description="Break this task down using Parent Task when creating a new task." /></div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {subtasks.map((s) => (
                    <button key={s.id} onClick={() => navigate(`/tasks/${s.id}`)} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm hover:bg-surface-subtle">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={getEmployeeName(s.assignedTo)} size="xs" />
                        <span className="font-medium text-ink">{s.title}</span>
                      </div>
                      <StatusBadge status={s.status} />
                    </button>
                  ))}
                </div>
              )}
            </Card>
          )}

          {(t.dependencies?.length > 0 || allowDependencies) && (
            <Card padded={false}>
              <CardHeader title="Dependencies" subtitle="This task's execution is gated by these" className="px-5 pt-5" />
              {t.dependencies?.length === 0 ? (
                <div className="px-5 pb-5"><EmptyState title="No dependencies" icon={Link2} /></div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {t.dependencies.map((d) => (
                    <DependencyRow key={d.taskId} dependencyId={d.taskId} type={d.type} navigate={navigate} />
                  ))}
                </div>
              )}
            </Card>
          )}

          <Card padded={false}>
            <CardHeader title="Attachments" subtitle={`${t.attachments?.length || 0} file(s)`} className="px-5 pt-5" />
            <div className="px-5 pb-5">
              {allowUpload && (
                <div id="task-detail-upload" className="mb-4">
                  <FileUpload onFiles={onUploadFiles} hint="Drawings, images, PDFs, BOQ files, site photos" />
                </div>
              )}
              {(t.attachments?.length || 0) === 0 ? (
                <EmptyState title="No attachments" icon={Paperclip} />
              ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {t.attachments.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950"><FileText className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{a.name}</p>
                        <p className="text-xs text-ink-faint">{a.size} · {getEmployeeName(a.uploadedBy)} · {formatDate(a.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Comments" subtitle={`${t.comments?.length || 0} comment(s)`} />
            <div className="flex flex-col gap-3">
              {(t.comments || []).map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={getEmployeeName(c.author)} size="sm" />
                  <div className="min-w-0 flex-1 rounded-lg bg-surface-subtle px-3 py-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-ink">{getEmployeeName(c.author)}</p>
                      <p className="text-[11px] text-ink-faint">{formatRelativeTime(c.time)}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-ink">{c.text}</p>
                  </div>
                </div>
              ))}
              {allowComment && (
                <div className="mt-1 flex items-center gap-2">
                  <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" onKeyDown={(e) => e.key === 'Enter' && submitComment()} />
                  <Button size="sm" icon={Send} onClick={submitComment}>Send</Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Related Records" />
            <div className="flex flex-col gap-2.5 text-sm">
              {project && (
                <button onClick={() => navigate(`/projects/${project.id}`)} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-left hover:bg-surface-subtle">
                  <span className="flex items-center gap-2"><FolderKanban className="h-4 w-4 text-ink-faint" />Project</span>
                  <span className="font-medium text-ink">{project.name}</span>
                </button>
              )}
              {t.milestone && (
                <button onClick={() => navigate('/projects/milestones')} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-left hover:bg-surface-subtle">
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-ink-faint" />Milestone</span>
                  <span className="font-medium text-ink">{t.milestone}</span>
                </button>
              )}
              {drawing && (
                <button onClick={() => navigate(`/design/drawings/${drawing.id}`)} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-left hover:bg-surface-subtle">
                  <span className="flex items-center gap-2"><Ruler className="h-4 w-4 text-ink-faint" />Drawing</span>
                  <span className="font-medium text-ink">{drawing.number}</span>
                </button>
              )}
              {t.relatedPO && (
                <button onClick={() => navigate('/procurement/purchase-orders')} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-left hover:bg-surface-subtle">
                  <span className="flex items-center gap-2"><Link2 className="h-4 w-4 text-ink-faint" />Purchase Order</span>
                  <span className="font-medium text-ink">{t.relatedPO}</span>
                </button>
              )}
              {t.relatedInvoice && (
                <button onClick={() => navigate(`/billing/invoices/${t.relatedInvoice}`)} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-left hover:bg-surface-subtle">
                  <span className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-ink-faint" />Invoice</span>
                  <span className="font-medium text-ink">{t.relatedInvoice}</span>
                </button>
              )}
              {!project && !t.milestone && !drawing && !t.relatedPO && !t.relatedInvoice && <EmptyState title="No related records" />}
            </div>
          </Card>

          <Card>
            <CardHeader title="Activity Timeline" />
            {(t.activity?.length || 0) === 0 ? (
              <EmptyState title="No activity yet" />
            ) : (
              <Timeline
                items={t.activity}
                renderContent={(item) => (
                  <p className="text-sm text-ink">
                    <span className="font-medium">{getEmployeeName(item.user)}</span>{' '}
                    <span className="text-ink-muted">{item.action}</span>
                    <span className="ml-2 text-xs text-ink-faint">{formatRelativeTime(item.time)}</span>
                  </p>
                )}
              />
            )}
          </Card>
        </div>
      </PageBody>

      <Modal open={logTimeOpen} onClose={() => setLogTimeOpen(false)} title="Log Time" description={`Against "${t.title}"`}
        footer={<><Button variant="secondary" onClick={() => setLogTimeOpen(false)}>Cancel</Button><Button loading={saving} onClick={handleSubmit(onLogTime)}>Log Time</Button></>}>
        <form onSubmit={handleSubmit(onLogTime)} className="flex flex-col gap-4">
          <Field label="Hours" required><Input type="number" step="0.5" min="0.5" {...register('hours', { required: true })} /></Field>
          <Field label="Description"><Textarea {...register('description')} placeholder="What did you work on?" /></Field>
        </form>
      </Modal>

      <Drawer open={reassignOpen} onClose={() => setReassignOpen(false)} title="Reassign Task"
        footer={<><Button variant="secondary" onClick={() => setReassignOpen(false)}>Cancel</Button><Button loading={saving} onClick={handleReassignSubmit(onReassign)}>Reassign</Button></>}>
        <form onSubmit={handleReassignSubmit(onReassign)} className="flex flex-col gap-4">
          <Field label="Assign to" required>
            <Select defaultValue={t.assignedTo || ''} {...registerReassign('assignedTo', { required: true })}>
              <option value="">Select employee</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.designation}</option>)}
            </Select>
          </Field>
        </form>
      </Drawer>
    </div>
  )
}

function DependencyRow({ dependencyId, type, navigate }) {
  const [dep, setDep] = useState(undefined)
  useEffect(() => {
    taskApi.get(dependencyId).then(setDep)
  }, [dependencyId])
  const typeLabel = { FS: 'Finish-to-Start', SS: 'Start-to-Start', FF: 'Finish-to-Finish' }[type] || type
  if (dep === undefined) return null
  return (
    <button onClick={() => dep && navigate(`/tasks/${dep.id}`)} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm hover:bg-surface-subtle">
      <div>
        <p className="font-medium text-ink">{dep?.title || dependencyId}</p>
        <p className="text-xs text-ink-faint">{typeLabel}</p>
      </div>
      {dep && <StatusBadge status={dep.status} />}
    </button>
  )
}
