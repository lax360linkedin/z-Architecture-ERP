import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, FileText, Send } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Field, Textarea } from '../../components/ui/Input'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Timeline } from '../../components/ui/Timeline'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { designApi } from '../../api/designApi'
import { getProjectName } from '../../data/projects'
import { getEmployeeName } from '../../data/employees'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'
import { useAuth } from '../../context/AuthContext'
import { logAudit } from '../../api/auditLogApi'

export default function DrawingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { can } = usePermissions()
  const allowUpload = can('design', 'upload')
  const [drawing, setDrawing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    const d = await designApi.drawings.get(id)
    setDrawing(d)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleSubmitRevision() {
    if (!note.trim()) {
      toast.error('Please add a note describing this revision')
      return
    }
    setSubmitting(true)
    try {
      await designApi.addRevision(id, note.trim())
      logAudit({ user, action: 'Submitted drawing revision', module: 'Design & Drawings', record: id, change: 'new revision added' })
      toast.success('New revision submitted')
      setNote('')
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to submit revision')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Loading drawing…" actions={<Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/design/drawings')}>Back</Button>} />
        <PageBody><Skeleton className="h-64 w-full" /></PageBody>
      </div>
    )
  }

  if (!drawing) {
    return (
      <div>
        <PageHeader title="Drawing not found" actions={<Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/design/drawings')}>Back</Button>} />
        <PageBody><EmptyState title="This drawing doesn't exist" description="It may have been removed." /></PageBody>
      </div>
    )
  }

  const orderedRevisions = [...drawing.revisions].sort((a, b) => new Date(a.date) - new Date(b.date))
  const currentRev = orderedRevisions[orderedRevisions.length - 1]?.rev

  const timelineItems = [...orderedRevisions].reverse().map((r, idx) => ({
    id: `${r.rev}-${idx}`,
    time: r.date,
    color: r.rev === currentRev ? 'bg-emerald-500' : 'bg-brand-500',
    title: r.note,
    rev: r.rev,
    isCurrent: r.rev === currentRev,
  }))

  return (
    <div>
      <PageHeader
        title={
          <button onClick={() => navigate('/design/drawings')} className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Drawing Register
          </button>
        }
        subtitle={null}
      />
      <PageBody className="flex flex-col gap-4">
        <Card>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-ink font-[Inter_Tight]">{drawing.number}</h1>
                <p className="text-sm text-ink-muted">{drawing.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge color="brand">Current: {currentRev}</Badge>
              <StatusBadge status={drawing.status} />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border-subtle pt-4 text-sm sm:grid-cols-4">
            <div><p className="text-xs text-ink-faint">Project</p><p className="mt-0.5 font-medium text-ink">{getProjectName(drawing.project)}</p></div>
            <div><p className="text-xs text-ink-faint">Category</p><p className="mt-0.5 font-medium text-ink">{drawing.category}</p></div>
            <div><p className="text-xs text-ink-faint">Prepared By</p><p className="mt-0.5 font-medium text-ink">{drawing.preparedBy ? getEmployeeName(drawing.preparedBy) : '—'}</p></div>
            <div><p className="text-xs text-ink-faint">Checked By</p><p className="mt-0.5 font-medium text-ink">{drawing.checkedBy ? getEmployeeName(drawing.checkedBy) : '—'}</p></div>
            <div><p className="text-xs text-ink-faint">Approved By</p><p className="mt-0.5 font-medium text-ink">{drawing.approvedBy ? getEmployeeName(drawing.approvedBy) : '—'}</p></div>
            <div><p className="text-xs text-ink-faint">Last Updated</p><p className="mt-0.5 font-medium text-ink">{formatDate(drawing.updatedDate)}</p></div>
          </div>
        </Card>

        {allowUpload && (
          <Card>
            <CardHeader title="Submit New Revision" subtitle="Adds a new entry to the revision history below and marks the drawing under review" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field label="Revision note" className="flex-1">
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe what changed in this revision…" rows={2} />
              </Field>
              <Button icon={Send} loading={submitting} onClick={handleSubmitRevision}>Submit Revision</Button>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader title="Revision History" subtitle="Complete history is preserved — nothing is ever removed" />
          <Timeline
            items={timelineItems}
            renderContent={(item) => (
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink">{item.rev}</p>
                  {item.isCurrent && <Badge color="success">Current</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-ink-muted">{item.title}</p>
                <p className="mt-0.5 text-xs text-ink-faint">{formatDate(item.time)}</p>
              </div>
            )}
          />
        </Card>
      </PageBody>
    </div>
  )
}
