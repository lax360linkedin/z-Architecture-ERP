import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Building2, FileText, Download } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Timeline } from '../../components/ui/Timeline'
import { EmptyState } from '../../components/ui/EmptyState'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { getCustomerById } from '../../data/customers'
import { projects } from '../../data/projects'
import { quotations } from '../../data/quotations'
import { invoices } from '../../data/invoices'
import { documents } from '../../data/designs'
import { formatCurrency, formatDate } from '../../utils/format'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'projects', label: 'Projects' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'quotations', label: 'Quotations' },
  { value: 'contracts', label: 'Contracts' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'payments', label: 'Payments' },
  { value: 'documents', label: 'Documents' },
  { value: 'activities', label: 'Activities' },
  { value: 'notes', label: 'Notes' },
]

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const customer = getCustomerById(id)

  const custProjects = useMemo(() => projects.filter((p) => p.client === id), [id])
  const custQuotations = useMemo(() => quotations.filter((q) => q.client === id), [id])
  const custInvoices = useMemo(() => invoices.filter((i) => i.client === id), [id])
  const custDocs = useMemo(() => documents.filter((d) => custProjects.some((p) => p.id === d.project)), [custProjects])

  const totalRevenue = custInvoices.reduce((s, i) => s + i.paid, 0)
  const outstanding = custInvoices.reduce((s, i) => s + (i.amount - i.paid), 0)

  const activity = useMemo(() => {
    const events = []
    custProjects.forEach((p) => events.push({ id: `p-${p.id}`, title: `Project "${p.name}" started`, time: p.startDate }))
    custQuotations.forEach((q) => events.push({ id: `q-${q.id}`, title: `Quotation ${q.id} — ${q.title} (${q.status})`, time: q.date }))
    custInvoices.forEach((i) => events.push({ id: `i-${i.id}`, title: `Invoice ${i.id} raised for ${formatCurrency(i.amount, { compact: true })}`, time: i.date }))
    return events.sort((a, b) => new Date(b.time) - new Date(a.time))
  }, [custProjects, custQuotations, custInvoices])

  if (!customer) {
    return (
      <div>
        <PageHeader title="Customer not found" actions={<Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/crm/customers')}>Back</Button>} />
        <PageBody><EmptyState title="This customer doesn't exist" description="It may have been removed." /></PageBody>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={
          <button onClick={() => navigate('/crm/customers')} className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Customers
          </button>
        }
        subtitle={null}
        className="pb-0"
      />
      <div className="border-b border-border bg-surface-raised px-4 pb-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <Avatar name={customer.name} size="lg" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ink font-[Inter_Tight]">{customer.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{customer.category}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{customer.city}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{customer.contact}</span>
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{customer.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={customer.status} />
            <Badge color="brand">Client since {formatDate(customer.since)}</Badge>
          </div>
        </div>
        <Tabs tabs={TABS} value={tab} onChange={setTab} className="mt-5 -mb-5 border-b-0" />
      </div>

      <PageBody>
        {tab === 'overview' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card><p className="text-xs font-medium text-ink-muted">Total Revenue</p><p className="mt-2 text-2xl font-bold text-ink font-[Inter_Tight]">{formatCurrency(totalRevenue, { compact: true })}</p></Card>
            <Card><p className="text-xs font-medium text-ink-muted">Outstanding</p><p className="mt-2 text-2xl font-bold text-ink font-[Inter_Tight]">{formatCurrency(outstanding, { compact: true })}</p></Card>
            <Card><p className="text-xs font-medium text-ink-muted">Active Projects</p><p className="mt-2 text-2xl font-bold text-ink font-[Inter_Tight]">{custProjects.filter((p) => p.status === 'in-progress').length}</p></Card>
            <Card className="lg:col-span-3">
              <CardHeader title="GST & Billing Details" />
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div><p className="text-xs text-ink-faint">Type</p><p className="mt-0.5 font-medium text-ink">{customer.type}</p></div>
                <div><p className="text-xs text-ink-faint">GSTIN</p><p className="mt-0.5 font-medium text-ink">{customer.gstin || 'Not applicable'}</p></div>
                <div><p className="text-xs text-ink-faint">City</p><p className="mt-0.5 font-medium text-ink">{customer.city}</p></div>
                <div><p className="text-xs text-ink-faint">Client since</p><p className="mt-0.5 font-medium text-ink">{formatDate(customer.since)}</p></div>
              </div>
            </Card>
          </div>
        )}

        {tab === 'projects' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {custProjects.length === 0 ? <EmptyState title="No projects yet" description="Projects for this customer will appear here." /> : custProjects.map((p) => (
              <Card key={p.id} className="cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-ink">{p.name}</p>
                    <p className="text-xs text-ink-faint">{p.code} · {p.location}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-3"><ProgressBar value={p.progress} color="auto" showLabel /></div>
                <p className="mt-2 text-xs text-ink-muted">{formatCurrency(p.budget, { compact: true })} budget</p>
              </Card>
            ))}
          </div>
        )}

        {tab === 'contacts' && (
          <Card>
            <div className="flex items-center gap-3 border-b border-border-subtle py-3 first:pt-0">
              <Avatar name={customer.name} />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{customer.name}</p>
                <p className="text-xs text-ink-faint">Primary Contact · {customer.type === 'Corporate' ? 'Authorized Signatory' : 'Owner'}</p>
              </div>
              <div className="text-right text-xs text-ink-muted">
                <p>{customer.contact}</p>
                <p>{customer.email}</p>
              </div>
            </div>
          </Card>
        )}

        {tab === 'quotations' && (
          <Card padded={false}>
            {custQuotations.length === 0 ? <EmptyState title="No quotations yet" /> : (
              <div className="divide-y divide-border-subtle">
                {custQuotations.map((q) => (
                  <div key={q.id} className="flex cursor-pointer items-center justify-between p-4 hover:bg-surface-subtle" onClick={() => navigate(`/sales/quotations/${q.id}`)}>
                    <div>
                      <p className="text-sm font-medium text-ink">{q.id} — {q.title}</p>
                      <p className="text-xs text-ink-faint">{formatDate(q.date)}</p>
                    </div>
                    <StatusBadge status={q.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === 'contracts' && (
          <Card padded={false}>
            {custQuotations.filter((q) => q.status === 'approved').length === 0 ? <EmptyState title="No signed contracts yet" description="Approved quotations become active contracts." /> : (
              <div className="divide-y divide-border-subtle">
                {custQuotations.filter((q) => q.status === 'approved').map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-ink-faint" />
                      <div>
                        <p className="text-sm font-medium text-ink">{q.title}</p>
                        <p className="text-xs text-ink-faint">Effective {formatDate(q.date)}</p>
                      </div>
                    </div>
                    <Badge color="success">Active</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === 'invoices' && (
          <Card padded={false}>
            {custInvoices.length === 0 ? <EmptyState title="No invoices yet" /> : (
              <div className="divide-y divide-border-subtle">
                {custInvoices.map((i) => (
                  <div key={i.id} className="flex cursor-pointer items-center justify-between p-4 hover:bg-surface-subtle" onClick={() => navigate(`/billing/invoices/${i.id}`)}>
                    <div>
                      <p className="text-sm font-medium text-ink">{i.id}</p>
                      <p className="text-xs text-ink-faint">Due {formatDate(i.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink">{formatCurrency(i.amount, { compact: true })}</p>
                      <StatusBadge status={i.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === 'payments' && (
          <Card padded={false}>
            {custInvoices.filter((i) => i.paid > 0).length === 0 ? <EmptyState title="No payments recorded" /> : (
              <div className="divide-y divide-border-subtle">
                {custInvoices.filter((i) => i.paid > 0).map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-4">
                    <p className="text-sm text-ink">Payment for {i.id}</p>
                    <p className="text-sm font-semibold text-emerald-600">{formatCurrency(i.paid, { compact: true })}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === 'documents' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {custDocs.length === 0 ? <EmptyState title="No documents" /> : custDocs.map((d) => (
              <Card key={d.id} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950"><FileText className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{d.name}</p>
                  <p className="text-xs text-ink-faint">{d.size} · {formatDate(d.date)}</p>
                </div>
                <Download className="h-4 w-4 shrink-0 text-ink-faint" />
              </Card>
            ))}
          </div>
        )}

        {tab === 'activities' && (
          <Card>{activity.length === 0 ? <EmptyState title="No activity yet" /> : <Timeline items={activity} />}</Card>
        )}

        {tab === 'notes' && (
          <Card>
            <p className="text-sm text-ink-muted">No notes added yet. Notes shared internally about this client will appear here.</p>
          </Card>
        )}
      </PageBody>
    </div>
  )
}
