import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CheckCircle2, MessageSquareWarning, ClipboardCheck } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Field, Textarea } from '../../components/ui/Input'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { designApi } from '../../api/designApi'
import { getProjectName } from '../../data/projects'
import { getEmployeeName } from '../../data/employees'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function DesignApprovals() {
  const navigate = useNavigate()
  const { can } = usePermissions()
  const allowApprove = can('design', 'approve')
  const [loading, setLoading] = useState(true)
  const [drawings, setDrawings] = useState([])
  const [busyId, setBusyId] = useState(null)
  const [changeModal, setChangeModal] = useState({ open: false, drawing: null })
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    const all = await designApi.drawings.all()
    setDrawings(all.filter((d) => d.status === 'under-review' || d.status === 'draft'))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleApprove(drawing) {
    setBusyId(drawing.id)
    try {
      await designApi.drawings.update(drawing.id, { status: 'approved', approvedBy: drawing.approvedBy || 'EMP-004' })
      toast.success(`${drawing.number} approved`)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to approve drawing')
    } finally {
      setBusyId(null)
    }
  }

  function openChangeModal(drawing) {
    setNote('')
    setChangeModal({ open: true, drawing })
  }

  async function handleRequestChanges() {
    if (!note.trim()) {
      toast.error('Please describe the requested changes')
      return
    }
    setSubmitting(true)
    try {
      await designApi.addRevision(changeModal.drawing.id, `Changes requested: ${note.trim()}`)
      toast.success(`Changes requested on ${changeModal.drawing.number}`)
      setChangeModal({ open: false, drawing: null })
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to request changes')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Design Approvals" subtitle={`${drawings.length} drawing(s) pending approval`} />
      <PageBody>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : drawings.length === 0 ? (
          <Card><EmptyState icon={ClipboardCheck} title="Nothing pending approval" description="All drawings are either approved or not yet submitted for review." /></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drawings.map((d) => (
              <Card key={d.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 cursor-pointer" onClick={() => navigate(`/design/drawings/${d.id}`)}>
                    <p className="truncate text-sm font-semibold text-ink hover:underline">{d.number}</p>
                    <p className="truncate text-xs text-ink-faint">{d.name}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                  <Badge>{d.category}</Badge>
                  <span>{getProjectName(d.project)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-border-subtle pt-2 text-xs">
                  <div><p className="text-ink-faint">Prepared By</p><p className="font-medium text-ink">{d.preparedBy ? getEmployeeName(d.preparedBy) : '—'}</p></div>
                  <div><p className="text-ink-faint">Revision</p><p className="font-medium text-ink">{d.revision}</p></div>
                </div>
                <p className="text-xs text-ink-faint">Updated {formatDate(d.updatedDate)}</p>
                {allowApprove && (
                  <div className="mt-1 flex gap-2">
                    <Button size="sm" className="flex-1 justify-center" icon={CheckCircle2} loading={busyId === d.id} onClick={() => handleApprove(d)}>Approve</Button>
                    <Button size="sm" variant="secondary" className="flex-1 justify-center" icon={MessageSquareWarning} onClick={() => openChangeModal(d)}>Request Changes</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </PageBody>

      <Modal
        open={changeModal.open}
        onClose={() => setChangeModal({ open: false, drawing: null })}
        title="Request Changes"
        description={changeModal.drawing ? `${changeModal.drawing.number} — ${changeModal.drawing.name}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setChangeModal({ open: false, drawing: null })}>Cancel</Button>
            <Button variant="danger" loading={submitting} onClick={handleRequestChanges}>Send Request</Button>
          </>
        }
      >
        <Field label="What needs to change?" required>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe the revisions the design team should make…" rows={4} />
        </Field>
      </Modal>
    </div>
  )
}
