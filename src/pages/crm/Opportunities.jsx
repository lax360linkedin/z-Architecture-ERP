import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Calendar, User } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Input'
import { Drawer } from '../../components/ui/Drawer'
import { Badge } from '../../components/ui/Badge'
import { PageLoader } from '../../components/layout/PageLoader'
import { crmApi } from '../../api/crmApi'
import { getEmployeeName, employees } from '../../data/employees'
import { formatCurrency, formatDate, classNames } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

const stageColors = {
  New: 'border-t-sky-400', Qualified: 'border-t-brand-400', Requirement: 'border-t-violet-400',
  'Site Visit': 'border-t-amber-400', Proposal: 'border-t-orange-400', Negotiation: 'border-t-pink-400',
  Won: 'border-t-emerald-400', Lost: 'border-t-red-400',
}

export default function Opportunities() {
  const { can } = usePermissions()
  const allowCreate = can('crm', 'create')
  const allowEdit = can('crm', 'edit')
  const [loading, setLoading] = useState(true)
  const [opportunities, setOpportunities] = useState([])
  const [dragId, setDragId] = useState(null)
  const [drawer, setDrawer] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  async function load() {
    setLoading(true)
    const data = await crmApi.listOpportunities()
    setOpportunities(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function moveTo(id, stage) {
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, stage } : o)))
    await crmApi.moveOpportunity(id, stage)
    toast.success(`Moved to ${stage}`)
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      await crmApi.createOpportunity({ ...values, value: Number(values.value) || 0, probability: Number(values.probability) || 10 })
      toast.success('Opportunity created')
      setDrawer(false)
      reset()
      load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  const totalValue = opportunities.filter((o) => !['Won', 'Lost'].includes(o.stage)).reduce((s, o) => s + o.value, 0)

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Opportunities"
        subtitle={`${opportunities.length} deals · ${formatCurrency(totalValue, { compact: true })} in open pipeline`}
        actions={allowCreate ? <Button icon={Plus} onClick={() => { reset({ owner: 'EMP-017' }); setDrawer(true) }}>New Opportunity</Button> : undefined}
      />
      <PageBody className="flex-1 overflow-x-auto">
        <div className="flex h-full gap-4" style={{ minWidth: `${crmApi.pipelineStages.length * 280}px` }}>
          {crmApi.pipelineStages.map((stage) => {
            const items = opportunities.filter((o) => o.stage === stage)
            const value = items.reduce((s, o) => s + o.value, 0)
            return (
              <div
                key={stage}
                onDragOver={allowEdit ? (e) => e.preventDefault() : undefined}
                onDrop={allowEdit ? () => dragId && moveTo(dragId, stage) : undefined}
                className="flex w-[270px] shrink-0 flex-col rounded-xl bg-surface-subtle"
              >
                <div className={classNames('flex items-center justify-between rounded-t-xl border-t-[3px] bg-surface-raised px-3 py-2.5', stageColors[stage])}>
                  <span className="text-sm font-semibold text-ink">{stage}</span>
                  <Badge>{items.length}</Badge>
                </div>
                <p className="px-3 py-1.5 text-xs text-ink-faint">{formatCurrency(value, { compact: true })}</p>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-3">
                  {items.map((o) => (
                    <div
                      key={o.id}
                      draggable={allowEdit}
                      onDragStart={allowEdit ? () => setDragId(o.id) : undefined}
                      className={classNames('space-y-2 rounded-lg border border-border bg-surface-raised p-3 shadow-soft', allowEdit && 'cursor-grab active:cursor-grabbing')}
                    >
                      <p className="text-sm font-semibold text-ink">{o.client}</p>
                      <p className="text-xs text-ink-muted line-clamp-2">{o.project}</p>
                      <p className="text-sm font-bold text-brand-600">{formatCurrency(o.value, { compact: true })}</p>
                      <div className="flex items-center justify-between text-xs text-ink-faint">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{getEmployeeName(o.owner).split(' ')[0]}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(o.expectedClose)}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${o.probability}%` }} />
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <p className="px-2 py-6 text-center text-xs text-ink-faint">Drop deals here</p>}
                </div>
              </div>
            )
          })}
        </div>
      </PageBody>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="New Opportunity" footer={<><Button variant="secondary" onClick={() => setDrawer(false)}>Cancel</Button><Button loading={saving} onClick={handleSubmit(onSubmit)}>Create</Button></>}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field label="Client / Company" required error={errors.client?.message}><Input {...register('client', { required: 'Required' })} /></Field>
          <Field label="Project / Opportunity name" required error={errors.project?.message}><Input {...register('project', { required: 'Required' })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estimated Value (₹)"><Input type="number" {...register('value')} /></Field>
            <Field label="Probability (%)"><Input type="number" {...register('probability')} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Owner">
              <Select {...register('owner')}>
                {employees.filter((e) => ['Sales Manager', 'Employee'].includes(e.role)).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
            <Field label="Expected Close"><Input type="date" {...register('expectedClose')} /></Field>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
