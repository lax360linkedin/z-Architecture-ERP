import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Calendar, FileText } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SearchInput, Select, Field, Input, Textarea } from '../../components/ui/Input'
import { Drawer } from '../../components/ui/Drawer'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { salesApi } from '../../api/salesApi'
import { customers } from '../../data/customers'
import { projects } from '../../data/projects'
import { getCustomerName } from '../../data/customers'
import { getEmployeeName, employees } from '../../data/employees'
import { formatCurrency, formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function Proposals() {
  const navigate = useNavigate()
  const { can } = usePermissions()
  const allowCreate = can('sales', 'create')
  const [loading, setLoading] = useState(true)
  const [quotations, setQuotations] = useState([])
  const [query, setQuery] = useState('')
  const [drawer, setDrawer] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  async function load() {
    setLoading(true)
    const all = await salesApi.quotations.all()
    setQuotations(all)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const proposals = useMemo(() => {
    const q = query.trim().toLowerCase()
    return quotations
      .filter((p) => ['draft', 'sent'].includes(p.status))
      .filter((p) => !q || p.title.toLowerCase().includes(q) || getCustomerName(p.client).toLowerCase().includes(q))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [quotations, query])

  async function onSubmit(values) {
    setSaving(true)
    try {
      await salesApi.quotations.create({
        ...values,
        status: 'draft',
        discount: 0,
        tax: 18,
        items: [{ service: values.scope || 'Proposal scope', qty: 1, unit: 'Lumpsum', rate: Number(values.value) || 0 }],
      })
      toast.success('Proposal created')
      setDrawer(false)
      reset()
      load()
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Proposals"
        subtitle={`${proposals.length} active proposals`}
        actions={allowCreate ? <Button icon={Plus} onClick={() => { reset({ owner: 'EMP-002', date: new Date().toISOString().slice(0, 10) }); setDrawer(true) }}>New Proposal</Button> : undefined}
      />
      <PageBody className="flex flex-col gap-4">
        <SearchInput value={query} onChange={setQuery} placeholder="Search proposals by title or client…" className="w-full max-w-sm" />

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : proposals.length === 0 ? (
          <Card><EmptyState icon={FileText} title="No proposals found" description="Create a new proposal to start pitching clients." action={allowCreate ? { label: 'New Proposal', icon: Plus, onClick: () => setDrawer(true) } : undefined} /></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {proposals.map((p) => {
              const totals = salesApi.quotationTotals(p)
              return (
                <Card key={p.id} className="flex cursor-pointer flex-col gap-3" onClick={() => navigate(`/sales/quotations/${p.id}`)}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-semibold text-ink">{p.title}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-ink-faint">{getCustomerName(p.client)}</p>
                  <p className="text-lg font-bold tracking-tight text-brand-600 font-[Inter_Tight]">{formatCurrency(totals.total, { compact: true })}</p>
                  <div className="flex items-center justify-between border-t border-border-subtle pt-3 text-xs text-ink-muted">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(p.date)}</span>
                    <span>{getEmployeeName(p.owner).split(' ')[0]}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </PageBody>

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="New Proposal" footer={<><Button variant="secondary" onClick={() => setDrawer(false)}>Cancel</Button><Button loading={saving} onClick={handleSubmit(onSubmit)}>Create</Button></>}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Client" required error={errors.client?.message}>
              <Select {...register('client', { required: 'Required' })}>
                <option value="">Select client</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Project">
              <Select {...register('project')}>
                <option value="">None</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Proposal Title" required error={errors.title?.message}>
            <Input {...register('title', { required: 'Title is required' })} placeholder="e.g. Boutique Hotel - Interior Concept Proposal" />
          </Field>
          <Field label="Scope Summary">
            <Textarea {...register('scope')} placeholder="Brief description of the proposed scope of work" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estimated Value (₹)"><Input type="number" {...register('value')} /></Field>
            <Field label="Owner">
              <Select {...register('owner')}>
                {employees.filter((e) => ['Sales Manager', 'Employee', 'Project Manager', 'Architect'].includes(e.role)).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><Input type="date" {...register('date')} /></Field>
            <Field label="Valid Until"><Input type="date" {...register('validity')} /></Field>
          </div>
          <Field label="Payment Terms">
            <Textarea {...register('terms')} placeholder="Proposed payment structure" />
          </Field>
        </form>
      </Drawer>
    </div>
  )
}
