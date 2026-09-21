import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Briefcase, MapPin, Calendar } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Input'
import { Drawer } from '../../components/ui/Drawer'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { PageLoader } from '../../components/layout/PageLoader'
import { hrApi } from '../../api/hrApi'
import { logAudit } from '../../api/auditLogApi'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../context/PermissionContext'
import { DEPARTMENTS } from '../../utils/constants'
import { formatDate, classNames } from '../../utils/format'

const stageColors = {
  Applications: 'border-t-sky-400', Screening: 'border-t-brand-400', Interview: 'border-t-violet-400',
  Evaluation: 'border-t-amber-400', Selected: 'border-t-emerald-400', Offer: 'border-t-orange-400', Onboarding: 'border-t-pink-400',
}

export default function Recruitment() {
  const { user } = useAuth()
  const { can } = usePermissions()
  const allowCreate = can('hr', 'create')
  const allowEdit = can('hr', 'edit')
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [jobFilter, setJobFilter] = useState('all')
  const [dragId, setDragId] = useState(null)
  const [jobDrawer, setJobDrawer] = useState(false)
  const [candidateDrawer, setCandidateDrawer] = useState(false)
  const [saving, setSaving] = useState(false)

  const jobForm = useForm()
  const candidateForm = useForm()

  async function load() {
    setLoading(true)
    const [j, c] = await Promise.all([hrApi.jobs.all(), hrApi.candidates.all()])
    setJobs(j)
    setCandidates(c)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function moveTo(id, stage) {
    if (!allowEdit) return
    const prevStage = candidates.find((c) => c.id === id)?.stage
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)))
    await hrApi.candidates.update(id, { stage })
    logAudit({ user, action: 'Updated candidate stage', module: 'HR', record: id, change: `${prevStage || 'Unknown'} → ${stage}` })
    toast.success(`Moved to ${stage}`)
  }

  async function onCreateJob(values) {
    setSaving(true)
    try {
      await hrApi.jobs.create({ ...values, openings: Number(values.openings) || 1, status: 'open', postedDate: new Date().toISOString().slice(0, 10) })
      toast.success('Job opening posted')
      setJobDrawer(false)
      jobForm.reset()
      load()
    } finally {
      setSaving(false)
    }
  }

  async function onCreateCandidate(values) {
    setSaving(true)
    try {
      await hrApi.candidates.create({ ...values, stage: 'Applications', appliedDate: new Date().toISOString().slice(0, 10) })
      toast.success('Candidate added')
      setCandidateDrawer(false)
      candidateForm.reset()
      load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  const visibleCandidates = jobFilter === 'all' ? candidates : candidates.filter((c) => c.job === jobFilter)

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Recruitment"
        subtitle={`${jobs.filter((j) => j.status === 'open').length} open positions · ${candidates.length} candidates in pipeline`}
        actions={
          allowCreate ? (
            <>
              <Button variant="secondary" icon={Plus} onClick={() => { jobForm.reset({ department: DEPARTMENTS[0] }); setJobDrawer(true) }}>New Job Opening</Button>
              <Button icon={Plus} onClick={() => { candidateForm.reset({ job: jobs[0]?.id }); setCandidateDrawer(true) }}>New Candidate</Button>
            </>
          ) : null
        }
      />
      <PageBody className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setJobFilter('all')}
            className={classNames('rounded-lg border px-3.5 py-2 text-left text-xs', jobFilter === 'all' ? 'border-brand-400 bg-brand-50 dark:bg-brand-950' : 'border-border bg-surface-raised hover:bg-surface-subtle')}
          >
            <p className="font-semibold text-ink">All Jobs</p>
            <p className="text-ink-faint">{candidates.length} candidates</p>
          </button>
          {jobs.map((j) => (
            <button
              key={j.id}
              onClick={() => setJobFilter(j.id)}
              className={classNames('rounded-lg border px-3.5 py-2 text-left text-xs', jobFilter === j.id ? 'border-brand-400 bg-brand-50 dark:bg-brand-950' : 'border-border bg-surface-raised hover:bg-surface-subtle')}
            >
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-ink">{j.title}</p>
                <StatusBadge status={j.status} />
              </div>
              <p className="text-ink-faint">{j.department} · {j.openings} opening(s)</p>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="flex h-full gap-4" style={{ minWidth: `${hrApi.recruitmentStages.length * 260}px` }}>
            {hrApi.recruitmentStages.map((stage) => {
              const items = visibleCandidates.filter((c) => c.stage === stage)
              return (
                <div
                  key={stage}
                  onDragOver={(e) => { if (allowEdit) e.preventDefault() }}
                  onDrop={() => allowEdit && dragId && moveTo(dragId, stage)}
                  className="flex w-[250px] shrink-0 flex-col rounded-xl bg-surface-subtle"
                >
                  <div className={classNames('flex items-center justify-between rounded-t-xl border-t-[3px] bg-surface-raised px-3 py-2.5', stageColors[stage])}>
                    <span className="text-sm font-semibold text-ink">{stage}</span>
                    <Badge>{items.length}</Badge>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 py-2.5">
                    {items.map((c) => {
                      const job = jobs.find((j) => j.id === c.job)
                      return (
                        <div
                          key={c.id}
                          draggable={allowEdit}
                          onDragStart={() => allowEdit && setDragId(c.id)}
                          className={classNames('space-y-2 rounded-lg border border-border bg-surface-raised p-3 shadow-soft', allowEdit ? 'cursor-grab active:cursor-grabbing' : '')}
                        >
                          <p className="text-sm font-semibold text-ink">{c.name}</p>
                          <p className="flex items-center gap-1 text-xs text-ink-muted"><Briefcase className="h-3 w-3" />{job?.title || 'Unknown role'}</p>
                          <div className="flex items-center justify-between text-xs text-ink-faint">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.experience}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(c.appliedDate)}</span>
                          </div>
                        </div>
                      )
                    })}
                    {items.length === 0 && <p className="px-2 py-6 text-center text-xs text-ink-faint">Drop candidates here</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </PageBody>

      <Drawer open={jobDrawer} onClose={() => setJobDrawer(false)} title="New Job Opening" footer={<><Button variant="secondary" onClick={() => setJobDrawer(false)}>Cancel</Button><Button loading={saving} onClick={jobForm.handleSubmit(onCreateJob)}>Post Opening</Button></>}>
        <form onSubmit={jobForm.handleSubmit(onCreateJob)} className="flex flex-col gap-4">
          <Field label="Job Title" required error={jobForm.formState.errors.title?.message}>
            <Input {...jobForm.register('title', { required: 'Required' })} />
          </Field>
          <Field label="Department">
            <Select {...jobForm.register('department')}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Location" required error={jobForm.formState.errors.location?.message}>
            <Input {...jobForm.register('location', { required: 'Required' })} />
          </Field>
          <Field label="Number of Openings">
            <Input type="number" min={1} {...jobForm.register('openings')} />
          </Field>
        </form>
      </Drawer>

      <Drawer open={candidateDrawer} onClose={() => setCandidateDrawer(false)} title="New Candidate" footer={<><Button variant="secondary" onClick={() => setCandidateDrawer(false)}>Cancel</Button><Button loading={saving} onClick={candidateForm.handleSubmit(onCreateCandidate)}>Add Candidate</Button></>}>
        <form onSubmit={candidateForm.handleSubmit(onCreateCandidate)} className="flex flex-col gap-4">
          <Field label="Candidate Name" required error={candidateForm.formState.errors.name?.message}>
            <Input {...candidateForm.register('name', { required: 'Required' })} />
          </Field>
          <Field label="Applying For">
            <Select {...candidateForm.register('job')}>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </Select>
          </Field>
          <Field label="Experience">
            <Input {...candidateForm.register('experience')} placeholder="e.g. 5 yrs" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" required error={candidateForm.formState.errors.email?.message}>
              <Input type="email" {...candidateForm.register('email', { required: 'Required' })} />
            </Field>
            <Field label="Phone" required error={candidateForm.formState.errors.phone?.message}>
              <Input {...candidateForm.register('phone', { required: 'Required' })} />
            </Field>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
