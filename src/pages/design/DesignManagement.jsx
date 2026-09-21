import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, PenTool } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Field, Select, Input, Textarea } from '../../components/ui/Input'
import { Pills } from '../../components/ui/Tabs'
import { Drawer } from '../../components/ui/Drawer'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { designApi } from '../../api/designApi'
import { designStages } from '../../data/designs'
import { projects, getProjectName } from '../../data/projects'
import { employees, getEmployeeName } from '../../data/employees'
import { formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function DesignManagement() {
  const { can } = usePermissions()
  const allowCreate = can('design', 'create')
  const [loading, setLoading] = useState(true)
  const [designs, setDesigns] = useState([])
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState('all')
  const [drawer, setDrawer] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { project: projects[0]?.id, stage: designStages[0], designer: employees[0]?.id, version: 'v1.0', status: 'in-progress', notes: '' },
  })

  async function load() {
    setLoading(true)
    const all = await designApi.designs.all()
    setDesigns(all)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    return designs.filter((d) => {
      const matchesStage = stage === 'all' || d.stage === stage
      const q = query.trim().toLowerCase()
      const matchesQuery = !q || d.notes.toLowerCase().includes(q) || getProjectName(d.project).toLowerCase().includes(q)
      return matchesStage && matchesQuery
    })
  }, [designs, stage, query])

  function openCreate() {
    reset({ project: projects[0]?.id, stage: designStages[0], designer: employees[0]?.id, version: 'v1.0', status: 'in-progress', notes: '' })
    setDrawer(true)
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      await designApi.designs.create({ ...values, updatedDate: new Date().toISOString().slice(0, 10) })
      toast.success('Design entry created')
      setDrawer(false)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to create design entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Design Management"
        subtitle={`${designs.length} design entries across all stages`}
        actions={allowCreate ? <Button icon={Plus} onClick={openCreate}>New Design Entry</Button> : undefined}
      />
      <PageBody className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by notes or project…" className="w-full max-w-xs" />
          <div className="overflow-x-auto">
            <Pills
              value={stage}
              onChange={setStage}
              options={[{ value: 'all', label: 'All Stages' }, ...designStages.map((s) => ({ value: s, label: s }))]}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card><EmptyState icon={PenTool} title="No design entries found" description="Try adjusting your filters, or create a new design entry." action={allowCreate ? { label: 'New Design Entry', icon: Plus, onClick: openCreate } : undefined} /></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((d) => (
              <Card key={d.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{getProjectName(d.project)}</p>
                  <StatusBadge status={d.status} />
                </div>
                <Badge color="brand" className="w-fit">{d.stage}</Badge>
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>{getEmployeeName(d.designer)}</span>
                  <span className="font-medium text-ink">{d.version}</span>
                </div>
                <p className="line-clamp-2 text-xs text-ink-faint">{d.notes}</p>
                <p className="border-t border-border-subtle pt-2 text-xs text-ink-faint">Updated {formatDate(d.updatedDate)}</p>
              </Card>
            ))}
          </div>
        )}
      </PageBody>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="New Design Entry"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onSubmit)}>Create Entry</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Project" required error={errors.project?.message}>
            <Select {...register('project', { required: 'Project is required' })}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Design Stage" required>
            <Select {...register('stage', { required: true })}>
              {designStages.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Designer" required>
            <Select {...register('designer', { required: true })}>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Version">
              <Input {...register('version')} placeholder="v1.0" />
            </Field>
            <Field label="Status">
              <Select {...register('status')}>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="approved">Approved</option>
              </Select>
            </Field>
          </div>
          <Field label="Notes">
            <Textarea {...register('notes')} placeholder="Describe the current design status…" />
          </Field>
        </form>
      </Drawer>
    </div>
  )
}
