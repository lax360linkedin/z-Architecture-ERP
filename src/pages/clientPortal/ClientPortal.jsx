import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  FolderKanban, Ruler, FileText, CheckCircle2, Receipt, IndianRupee, Camera, CalendarDays,
  LifeBuoy, Download, ThumbsUp, RotateCcw, MapPin, Clock3, Users2, Cloud, Send,
} from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Modal } from '../../components/ui/Modal'
import { Field, Input, Textarea, Select } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton, Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { clientPortalApi } from '../../api/clientPortalApi'
import { getCustomerName } from '../../data/customers'
import { getEmployeeName } from '../../data/employees'
import { quotationTotals } from '../../data/quotations'
import { formatCurrency, formatDate } from '../../utils/format'

const TABS = [
  { value: 'projects', label: 'Projects', icon: FolderKanban },
  { value: 'drawings', label: 'Drawings', icon: Ruler },
  { value: 'documents', label: 'Documents', icon: FileText },
  { value: 'approvals', label: 'Approvals', icon: CheckCircle2 },
  { value: 'quotations', label: 'Quotations', icon: Receipt },
  { value: 'invoices', label: 'Invoices', icon: IndianRupee },
  { value: 'photos', label: 'Site Photos', icon: Camera },
  { value: 'meetings', label: 'Meetings', icon: CalendarDays },
  { value: 'support', label: 'Support', icon: LifeBuoy },
]

const PENDING_DRAWING_STATUSES = ['under-review', 'draft']

export default function ClientPortal() {
  const { user } = useAuth()
  const customerId = user?.customerId || 'CUST-001'
  const [tab, setTab] = useState('projects')
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [drawings, setDrawings] = useState([])
  const [documents, setDocuments] = useState([])
  const [quotations, setQuotations] = useState([])
  const [invoices, setInvoices] = useState([])
  const [photos, setPhotos] = useState([])
  const [meetings, setMeetings] = useState([])
  const [tickets, setTickets] = useState([])
  const [projectDetail, setProjectDetail] = useState(null)
  const [revisionTarget, setRevisionTarget] = useState(null)
  const [revisionNote, setRevisionNote] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { title: '', description: '', priority: 'medium' } })

  function loadAll() {
    setLoading(true)
    Promise.all([
      clientPortalApi.projectsFor(customerId),
      clientPortalApi.drawingsFor(customerId),
      clientPortalApi.documentsFor(customerId),
      clientPortalApi.quotationsFor(customerId),
      clientPortalApi.invoicesFor(customerId),
      clientPortalApi.sitePhotosFor(customerId),
      clientPortalApi.meetingsFor(customerId),
      clientPortalApi.ticketsFor(customerId),
    ]).then(([p, d, doc, q, inv, ph, m, t]) => {
      setProjects(p)
      setDrawings(d)
      setDocuments(doc)
      setQuotations(q)
      setInvoices(inv)
      setPhotos(ph)
      setMeetings(m)
      setTickets(t)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  async function refreshDrawings() {
    const d = await clientPortalApi.drawingsFor(customerId)
    setDrawings(d)
  }

  async function handleApprove(drawing) {
    try {
      await clientPortalApi.approveDrawing(drawing.id)
      toast.success(`${drawing.name} approved`)
      refreshDrawings()
    } catch (err) {
      toast.error(err.message || 'Could not approve drawing')
    }
  }

  function openRevisionModal(drawing) {
    setRevisionNote('')
    setRevisionTarget(drawing)
  }

  async function submitRevision() {
    if (!revisionNote.trim()) {
      toast.error('Please describe the revision you need')
      return
    }
    try {
      await clientPortalApi.requestRevision(revisionTarget.id, revisionNote.trim())
      toast.success(`Revision requested for ${revisionTarget.name}`)
      setRevisionTarget(null)
      refreshDrawings()
    } catch (err) {
      toast.error(err.message || 'Could not submit revision request')
    }
  }

  function onRaiseTicket(values) {
    const ticket = {
      id: `TKT-${Math.floor(Math.random() * 9000) + 1000}`,
      customer: customerId,
      project: projects[0]?.id || null,
      subject: values.title,
      priority: values.priority,
      assignedTo: null,
      status: 'Open',
      createdDate: new Date().toISOString().slice(0, 10),
      messages: [{ from: customerId, text: values.description, time: new Date().toISOString() }],
    }
    setTickets((prev) => [ticket, ...prev])
    toast.success('Support ticket raised — our team will respond shortly')
    reset({ title: '', description: '', priority: 'medium' })
  }

  const pendingDrawings = drawings.filter((d) => PENDING_DRAWING_STATUSES.includes(d.status))
  const upcomingMeetings = meetings.filter((m) => m.status === 'scheduled')
  const pastMeetings = meetings.filter((m) => m.status !== 'scheduled')
  const openTickets = tickets.filter((t) => !['Resolved', 'Closed'].includes(t.status))
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div>
      <div className="border-b border-border bg-gradient-to-br from-brand-50 via-surface-raised to-surface-raised px-4 py-8 dark:from-brand-950/40 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">Client Portal</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink font-[Inter_Tight] sm:text-3xl">Welcome back, {firstName}</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">
          Track your projects, review drawings, and stay on top of documents, invoices and site updates — all in one place.
        </p>
        <div className="mt-5">
          <Tabs tabs={TABS.map((t) => ({ ...t, count: t.value === 'approvals' ? pendingDrawings.length || undefined : t.value === 'support' ? openTickets.length || undefined : undefined }))} value={tab} onChange={setTab} className="border-b-0" />
        </div>
      </div>

      <PageBody className="mx-auto max-w-6xl">
        {tab === 'projects' && (
          loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} className="h-40" />)}</div>
          ) : projects.length === 0 ? (
            <EmptyState title="No projects yet" description="Your active projects will appear here once work begins." />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {projects.map((p) => (
                <Card key={p.id} className="flex cursor-pointer flex-col gap-4 transition-shadow hover:shadow-popover" onClick={() => setProjectDetail(p)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-ink">{p.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-faint"><MapPin className="h-3.5 w-3.5" />{p.location}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <ProgressBar value={p.progress} color="auto" showLabel size="lg" />
                  <div className="flex items-center justify-between border-t border-border-subtle pt-3 text-xs text-ink-muted">
                    <span>Stage: <span className="font-medium text-ink">{p.stage}</span></span>
                    <span>Deadline: <span className="font-medium text-ink">{formatDate(p.deadline)}</span></span>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}

        {tab === 'drawings' && (
          loading ? <Skeleton className="h-64 w-full" /> : drawings.length === 0 ? (
            <EmptyState icon={Ruler} title="No drawings shared yet" description="Drawings ready for your review will show up here." />
          ) : (
            <div className="flex flex-col gap-3">
              {drawings.map((d) => (
                <Card key={d.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{d.name}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">{d.number} · {d.category} · {d.revision} · Updated {formatDate(d.updatedDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={d.status} />
                    {PENDING_DRAWING_STATUSES.includes(d.status) && (
                      <>
                        <Button size="sm" variant="secondary" icon={ThumbsUp} onClick={() => handleApprove(d)}>Approve</Button>
                        <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => openRevisionModal(d)}>Request Revision</Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )
        )}

        {tab === 'documents' && (
          loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : documents.length === 0 ? (
            <EmptyState icon={FileText} title="No documents shared yet" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((d) => (
                <Card key={d.id} className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{d.name}</p>
                    <p className="text-xs text-ink-faint">{d.size} · {formatDate(d.date)}</p>
                  </div>
                  <button
                    onClick={() => toast.success(`Downloading ${d.name}`)}
                    className="rounded-md p-2 text-ink-faint hover:bg-surface-subtle hover:text-ink"
                    aria-label="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </Card>
              ))}
            </div>
          )
        )}

        {tab === 'approvals' && (
          loading ? <Skeleton className="h-56 w-full" /> : pendingDrawings.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nothing awaiting your approval" description="You're all caught up — new drawings for review will appear here." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {pendingDrawings.map((d) => (
                <Card key={d.id} className="flex flex-col gap-3 border-amber-200 dark:border-amber-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink">{d.name}</p>
                      <p className="mt-0.5 text-xs text-ink-faint">{d.number} · {d.category}</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-xs text-ink-muted">Prepared by {getEmployeeName(d.preparedBy)} · {d.revision}</p>
                  <div className="flex gap-2 border-t border-border-subtle pt-3">
                    <Button size="sm" className="flex-1 justify-center" icon={ThumbsUp} onClick={() => handleApprove(d)}>Approve</Button>
                    <Button size="sm" variant="secondary" className="flex-1 justify-center" icon={RotateCcw} onClick={() => openRevisionModal(d)}>Revise</Button>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}

        {tab === 'quotations' && (
          loading ? <Skeleton className="h-56 w-full" /> : quotations.length === 0 ? (
            <EmptyState icon={Receipt} title="No quotations yet" />
          ) : (
            <div className="flex flex-col gap-3">
              {quotations.map((q) => (
                <Card key={q.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{q.title}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">{q.id} · Issued {formatDate(q.date)} · Valid till {formatDate(q.validity)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-ink">{formatCurrency(quotationTotals(q).total, { compact: true })}</span>
                    <StatusBadge status={q.status} />
                  </div>
                </Card>
              ))}
            </div>
          )
        )}

        {tab === 'invoices' && (
          loading ? <Skeleton className="h-56 w-full" /> : invoices.length === 0 ? (
            <EmptyState icon={IndianRupee} title="No invoices yet" />
          ) : (
            <div className="flex flex-col gap-3">
              {invoices.map((i) => (
                <Card key={i.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{i.id}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">Issued {formatDate(i.date)} · Due {formatDate(i.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink">{formatCurrency(i.amount, { compact: true })}</p>
                      {i.paid > 0 && i.paid < i.amount && <p className="text-xs text-ink-faint">{formatCurrency(i.paid, { compact: true })} paid</p>}
                    </div>
                    <StatusBadge status={i.status} />
                    {i.status !== 'paid' && (
                      <Button size="sm" onClick={() => toast.success(`Redirecting to secure payment for ${i.id} (demo)`)}>Pay Now</Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )
        )}

        {tab === 'photos' && (
          loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} className="h-48" />)}</div>
          ) : photos.length === 0 ? (
            <EmptyState icon={Camera} title="No site photos yet" description="Site progress photos will be posted here by your project team." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((s) => (
                <Card key={s.id} padded={false} className="overflow-hidden">
                  <div className="flex h-32 items-center justify-center gap-2 bg-gradient-to-br from-brand-100 to-brand-50 text-brand-500 dark:from-brand-950 dark:to-brand-900">
                    <Camera className="h-8 w-8" />
                    <span className="text-lg font-bold">{s.photos}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4">
                    <div className="flex items-center justify-between text-xs text-ink-faint">
                      <span>{formatDate(s.date)}</span>
                      <span className="flex items-center gap-1"><Cloud className="h-3.5 w-3.5" />{s.weather}</span>
                    </div>
                    <p className="text-sm text-ink">{s.workCompleted}</p>
                    <p className="flex items-center gap-1 text-xs text-ink-faint"><Users2 className="h-3.5 w-3.5" />{s.labourCount} workers on site</p>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}

        {tab === 'meetings' && (
          loading ? <Skeleton className="h-56 w-full" /> : meetings.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No meetings scheduled" />
          ) : (
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Upcoming</p>
                {upcomingMeetings.length === 0 ? (
                  <p className="text-sm text-ink-muted">No upcoming meetings.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {upcomingMeetings.map((m) => (
                      <Card key={m.id} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-ink">{m.title}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
                            <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(m.date)}</span>
                            <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{m.time} ({m.duration})</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{m.location}</span>
                          </p>
                        </div>
                        <StatusBadge status={m.status} />
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              {pastMeetings.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Past</p>
                  <div className="flex flex-col gap-3">
                    {pastMeetings.map((m) => (
                      <Card key={m.id} className="flex flex-col gap-1.5 opacity-80 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-ink">{m.title}</p>
                          <p className="mt-0.5 text-xs text-ink-faint">{formatDate(m.date)} · {m.location}</p>
                        </div>
                        <StatusBadge status={m.status} />
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {tab === 'support' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <CardHeader title="Raise a Ticket" subtitle="Tell us what you need help with" />
              <form onSubmit={handleSubmit(onRaiseTicket)} className="flex flex-col gap-4">
                <Field label="Subject" required error={errors.title?.message}>
                  <Input {...register('title', { required: 'Subject is required' })} placeholder="e.g. Query about invoice" />
                </Field>
                <Field label="Description" required error={errors.description?.message}>
                  <Textarea {...register('description', { required: 'Please add a description' })} placeholder="Describe your request in detail…" />
                </Field>
                <Field label="Priority">
                  <Select {...register('priority')}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </Field>
                <Button type="submit" icon={Send} className="justify-center">Submit Ticket</Button>
              </form>
            </Card>
            <div className="flex flex-col gap-3 lg:col-span-3">
              {tickets.length === 0 ? (
                <Card><EmptyState icon={LifeBuoy} title="No tickets raised yet" description="Tickets you raise will show up here with their status." /></Card>
              ) : (
                tickets.map((t) => (
                  <Card key={t.id} className="flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-ink">{t.subject}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs text-ink-faint">{t.id} · Raised {formatDate(t.createdDate)}</p>
                    <div className="mt-1">
                      <Badge color={t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'neutral'}>{t.priority} priority</Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </PageBody>

      <Modal open={!!projectDetail} onClose={() => setProjectDetail(null)} title={projectDetail?.name} description={projectDetail?.location} size="lg">
        {projectDetail && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink-muted">{projectDetail.description}</p>
            <ProgressBar value={projectDetail.progress} color="auto" showLabel size="lg" />
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div><p className="text-xs text-ink-faint">Client</p><p className="mt-0.5 font-medium text-ink">{getCustomerName(projectDetail.client)}</p></div>
              <div><p className="text-xs text-ink-faint">Stage</p><p className="mt-0.5 font-medium text-ink">{projectDetail.stage}</p></div>
              <div><p className="text-xs text-ink-faint">Area</p><p className="mt-0.5 font-medium text-ink">{projectDetail.area}</p></div>
              <div><p className="text-xs text-ink-faint">Start Date</p><p className="mt-0.5 font-medium text-ink">{formatDate(projectDetail.startDate)}</p></div>
              <div><p className="text-xs text-ink-faint">Deadline</p><p className="mt-0.5 font-medium text-ink">{formatDate(projectDetail.deadline)}</p></div>
              <div><p className="text-xs text-ink-faint">Project Manager</p><p className="mt-0.5 font-medium text-ink">{getEmployeeName(projectDetail.manager)}</p></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!revisionTarget} onClose={() => setRevisionTarget(null)} title="Request a Revision" description={revisionTarget?.name} size="sm">
        <div className="flex flex-col gap-4">
          <Field label="What would you like changed?" required>
            <Textarea value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} placeholder="Describe the revision you need…" rows={5} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRevisionTarget(null)}>Cancel</Button>
            <Button icon={Send} onClick={submitRevision}>Submit Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
