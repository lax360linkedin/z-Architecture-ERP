import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input } from '../../components/ui/Input'
import { Drawer } from '../../components/ui/Drawer'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { milestones } from '../../data/tasks'
import { projects, getProjectName } from '../../data/projects'
import { nextId } from '../../api/mockClient'

const milestoneStatuses = ['completed', 'in-progress', 'pending', 'delayed']

export default function ProjectMilestones() {
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawer, setDrawer] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return milestones
      .filter((m) => !q || m.name.toLowerCase().includes(q))
      .filter((m) => projectFilter === 'all' || m.project === projectFilter)
      .filter((m) => statusFilter === 'all' || m.status === statusFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, projectFilter, statusFilter, version])

  async function onSubmit(values) {
    setSaving(true)
    try {
      milestones.unshift({
        id: nextId('MS'),
        project: values.project,
        name: values.name,
        dueDate: values.dueDate,
        status: values.status,
        progress: Number(values.progress) || 0,
      })
      toast.success('Milestone created')
      setDrawer(false)
      reset()
      setVersion((v) => v + 1)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Milestones"
        subtitle={`${filtered.length} milestones across all projects`}
        actions={<Button icon={Plus} onClick={() => { reset({ project: projects[0]?.id, status: 'pending', progress: 0 }); setDrawer(true) }}>New Milestone</Button>}
      />
      <PageBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Search milestones…" className="w-full max-w-xs" />
          <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="w-auto min-w-[180px]">
            <option value="all">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto min-w-[140px]">
            <option value="all">All Status</option>
            {milestoneStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>

        {filtered.length === 0 ? (
          <Card><EmptyState title="No milestones found" description="Try adjusting filters, or create a new milestone." action={{ label: 'New Milestone', icon: Plus, onClick: () => setDrawer(true) }} /></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <Card key={m.id} className="flex cursor-pointer flex-col gap-3" onClick={() => navigate(`/projects/${m.project}/milestones`)}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{m.name}</p>
                  <StatusBadge status={m.status} />
                </div>
                <p className="text-xs text-ink-faint">{getProjectName(m.project)}</p>
                <p className="text-xs text-ink-faint">Due {new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(m.dueDate))}</p>
                <ProgressBar value={m.progress} color="auto" showLabel />
              </Card>
            ))}
          </div>
        )}
      </PageBody>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="New Milestone" footer={<><Button variant="secondary" onClick={() => setDrawer(false)}>Cancel</Button><Button loading={saving} onClick={handleSubmit(onSubmit)}>Create</Button></>}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Project" required error={errors.project?.message}>
            <Select {...register('project', { required: 'Required' })}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Milestone Name" required error={errors.name?.message}>
            <Input {...register('name', { required: 'Name is required' })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due Date"><Input type="date" {...register('dueDate')} /></Field>
            <Field label="Status">
              <Select {...register('status')}>
                {milestoneStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Progress (%)">
            <Input type="number" min="0" max="100" {...register('progress')} />
          </Field>
        </form>
      </Drawer>
    </div>
  )
}
