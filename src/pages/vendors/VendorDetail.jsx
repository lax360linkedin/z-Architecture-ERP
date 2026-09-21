import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Building2, FileText, Star, TrendingUp, IndianRupee } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Timeline } from '../../components/ui/Timeline'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { vendorApi } from '../../api/vendorApi'
import { vendorQuotations, rfqs } from '../../data/procurement'
import { formatCurrency, formatDate } from '../../utils/format'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'documents', label: 'Documents' },
  { value: 'contracts', label: 'Contracts' },
  { value: 'quotations', label: 'Quotations' },
  { value: 'orders', label: 'Purchase Orders' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'payments', label: 'Payments' },
  { value: 'performance', label: 'Performance' },
  { value: 'activity', label: 'Activity' },
]

export default function VendorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [vendor, setVendor] = useState(null)
  const [orders, setOrders] = useState([])
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    setLoading(true)
    Promise.all([vendorApi.get(id), vendorApi.ordersFor(id), vendorApi.invoicesFor(id)]).then(([v, o, i]) => {
      setVendor(v)
      setOrders(o)
      setInvoices(i)
      setLoading(false)
    })
  }, [id])

  const quotations = useMemo(() => vendorQuotations.filter((q) => q.vendor === id), [id])

  const totalBusinessValue = useMemo(() => orders.reduce((s, o) => s + o.quantity * o.rate, 0), [orders])
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length
  const onTimeRate = orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 0
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalOutstanding = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)

  const activity = useMemo(() => {
    const events = []
    orders.forEach((o) => events.push({ id: `po-${o.id}`, title: `Purchase Order ${o.id} — ${o.item} (${o.status})`, time: o.date }))
    invoices.forEach((i) => events.push({ id: `pi-${i.id}`, title: `Invoice ${i.id} raised for ${formatCurrency(i.amount, { compact: true })}`, time: i.date }))
    quotations.forEach((q) => events.push({ id: `vq-${q.id}`, title: `Quotation ${q.id} submitted — ${formatCurrency(q.amount, { compact: true })}`, time: q.validity }))
    return events.sort((a, b) => new Date(b.time) - new Date(a.time))
  }, [orders, invoices, quotations])

  if (loading) {
    return (
      <div>
        <PageHeader title="Loading…" />
        <PageBody><Skeleton className="h-64 w-full" /></PageBody>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div>
        <PageHeader title="Vendor not found" actions={<Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/vendors')}>Back</Button>} />
        <PageBody><EmptyState title="This vendor doesn't exist" description="It may have been removed." /></PageBody>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={
          <button onClick={() => navigate('/vendors')} className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Vendors
          </button>
        }
        subtitle={null}
        className="pb-0"
      />
      <div className="border-b border-border bg-surface-raised px-4 pb-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <Avatar name={vendor.name} size="lg" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ink font-[Inter_Tight]">{vendor.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{vendor.category}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{vendor.city}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{vendor.contact}</span>
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{vendor.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="warning" dot><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {vendor.rating.toFixed(1)}</Badge>
            <StatusBadge status={vendor.status} />
            <Badge color="brand">Vendor since {formatDate(vendor.since)}</Badge>
          </div>
        </div>
        <Tabs tabs={TABS} value={tab} onChange={setTab} className="mt-5 -mb-5 border-b-0" />
      </div>

      <PageBody>
        {tab === 'overview' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card><p className="text-xs font-medium text-ink-muted">Total Business Value</p><p className="mt-2 text-2xl font-bold text-ink font-[Inter_Tight]">{formatCurrency(totalBusinessValue, { compact: true })}</p></Card>
            <Card><p className="text-xs font-medium text-ink-muted">Outstanding Payments</p><p className="mt-2 text-2xl font-bold text-ink font-[Inter_Tight]">{formatCurrency(totalOutstanding, { compact: true })}</p></Card>
            <Card><p className="text-xs font-medium text-ink-muted">Active Purchase Orders</p><p className="mt-2 text-2xl font-bold text-ink font-[Inter_Tight]">{orders.filter((o) => o.status !== 'delivered').length}</p></Card>
            <Card className="lg:col-span-3">
              <CardHeader title="GST & Billing Details" />
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div><p className="text-xs text-ink-faint">Category</p><p className="mt-0.5 font-medium text-ink">{vendor.category}</p></div>
                <div><p className="text-xs text-ink-faint">GSTIN</p><p className="mt-0.5 font-medium text-ink">{vendor.gstin || 'Not available'}</p></div>
                <div><p className="text-xs text-ink-faint">City</p><p className="mt-0.5 font-medium text-ink">{vendor.city}</p></div>
                <div><p className="text-xs text-ink-faint">Vendor since</p><p className="mt-0.5 font-medium text-ink">{formatDate(vendor.since)}</p></div>
              </div>
            </Card>
          </div>
        )}

        {tab === 'contacts' && (
          <Card>
            <div className="flex items-center gap-3 border-b border-border-subtle py-3 first:pt-0">
              <Avatar name={vendor.name} />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{vendor.name}</p>
                <p className="text-xs text-ink-faint">Primary Contact · {vendor.category}</p>
              </div>
              <div className="text-right text-xs text-ink-muted">
                <p>{vendor.contact}</p>
                <p>{vendor.email}</p>
              </div>
            </div>
          </Card>
        )}

        {tab === 'documents' && (
          <Card><EmptyState title="No documents uploaded" description="Vendor compliance documents (GST certificate, PAN, agreements) will appear here." /></Card>
        )}

        {tab === 'contracts' && (
          <Card padded={false}>
            {orders.length === 0 ? <EmptyState title="No active contracts" description="Purchase orders act as contracts once approved." /> : (
              <div className="divide-y divide-border-subtle">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-ink-faint" />
                      <div>
                        <p className="text-sm font-medium text-ink">{o.item}</p>
                        <p className="text-xs text-ink-faint">PO {o.id} · Effective {formatDate(o.date)}</p>
                      </div>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === 'quotations' && (
          <Card padded={false}>
            {quotations.length === 0 ? <EmptyState title="No quotations submitted" /> : (
              <div className="divide-y divide-border-subtle">
                {quotations.map((q) => {
                  const rfq = rfqs.find((r) => r.id === q.rfq)
                  return (
                    <div key={q.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-ink">{q.id} — {rfq?.item || q.rfq}</p>
                        <p className="text-xs text-ink-faint">Delivery in {q.deliveryDays}d · Valid till {formatDate(q.validity)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink">{formatCurrency(q.amount, { compact: true })}</p>
                        <StatusBadge status={q.status} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        )}

        {tab === 'orders' && (
          <Card padded={false}>
            {orders.length === 0 ? <EmptyState title="No purchase orders yet" /> : (
              <div className="divide-y divide-border-subtle">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-ink">{o.id} — {o.item}</p>
                      <p className="text-xs text-ink-faint">{o.quantity} {o.unit} · Delivery {formatDate(o.deliveryDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink">{formatCurrency(o.quantity * o.rate, { compact: true })}</p>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === 'invoices' && (
          <Card padded={false}>
            {invoices.length === 0 ? <EmptyState title="No invoices yet" /> : (
              <div className="divide-y divide-border-subtle">
                {invoices.map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-ink">{i.id}</p>
                      <p className="text-xs text-ink-faint">Against PO {i.po} · Due {formatDate(i.dueDate)}</p>
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
            {invoices.filter((i) => i.status === 'paid').length === 0 ? <EmptyState title="No payments recorded" /> : (
              <div className="divide-y divide-border-subtle">
                {invoices.filter((i) => i.status === 'paid').map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-4">
                    <p className="text-sm text-ink">Payment for {i.id}</p>
                    <p className="text-sm font-semibold text-emerald-600">{formatCurrency(i.amount, { compact: true })}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === 'performance' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="flex flex-col gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40"><Star className="h-4 w-4" /></span>
              <p className="text-xs font-medium text-ink-muted">Vendor Rating</p>
              <p className="text-2xl font-bold text-ink font-[Inter_Tight]">{vendor.rating.toFixed(1)} / 5</p>
            </Card>
            <Card className="flex flex-col gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"><TrendingUp className="h-4 w-4" /></span>
              <p className="text-xs font-medium text-ink-muted">On-Time Delivery Rate</p>
              <p className="text-2xl font-bold text-ink font-[Inter_Tight]">{onTimeRate}%</p>
              <p className="text-xs text-ink-faint">{deliveredCount} of {orders.length} orders delivered</p>
            </Card>
            <Card className="flex flex-col gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950"><IndianRupee className="h-4 w-4" /></span>
              <p className="text-xs font-medium text-ink-muted">Total Business Value</p>
              <p className="text-2xl font-bold text-ink font-[Inter_Tight]">{formatCurrency(totalBusinessValue, { compact: true })}</p>
            </Card>
          </div>
        )}

        {tab === 'activity' && (
          <Card>{activity.length === 0 ? <EmptyState title="No activity yet" /> : <Timeline items={activity} />}</Card>
        )}
      </PageBody>
    </div>
  )
}
