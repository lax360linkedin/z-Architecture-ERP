import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ArrowLeft, Download, Printer, IndianRupee, Mail, Phone, Globe } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Field, Input } from '../../components/ui/Input'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { LogoMark } from '../../components/layout/Logo'
import { billingApi } from '../../api/billingApi'
import { logAudit } from '../../api/auditLogApi'
import { useAuth } from '../../context/AuthContext'
import { getCustomerById } from '../../data/customers'
import { getProjectById } from '../../data/projects'
import { company } from '../../data/admin'
import { formatCurrency, formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

const GST_RATE = 0.18

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { can } = usePermissions()
  const allowRecordPayment = can('billing', 'edit')
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState(null)
  const [payModal, setPayModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    setLoading(true)
    billingApi.invoices.get(id).then((inv) => {
      setInvoice(inv)
      setLoading(false)
    })
  }, [id])

  function openPayModal() {
    reset({ amount: invoice ? invoice.amount - invoice.paid : 0 })
    setPayModal(true)
  }

  async function onRecordPayment(values) {
    setSaving(true)
    try {
      const amount = Number(values.amount) || 0
      await billingApi.markPaid(id, amount)
      const updated = await billingApi.invoices.get(id)
      setInvoice(updated)
      logAudit({ user, action: 'Recorded payment against invoice', module: 'Billing', record: id, change: `+${formatCurrency(amount)} paid` })
      toast.success('Payment recorded successfully')
      setPayModal(false)
    } catch (err) {
      toast.error(err.message || 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleDownload() {
    toast.success(`${invoice?.id || 'Invoice'}.pdf downloaded`)
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Invoice" actions={<Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/billing/invoices')}>Back</Button>} />
        <PageBody>
          <Card><Skeleton className="h-96 w-full" /></Card>
        </PageBody>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div>
        <PageHeader title="Invoice not found" actions={<Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/billing/invoices')}>Back</Button>} />
        <PageBody><EmptyState title="This invoice doesn't exist" description="It may have been removed or the link is incorrect." /></PageBody>
      </div>
    )
  }

  const client = getCustomerById(invoice.client)
  const project = getProjectById(invoice.project)
  const items = invoice.items?.length ? invoice.items : [{ desc: 'Professional Services', qty: 1, rate: invoice.amount }]
  const subtotal = items.reduce((s, it) => s + it.qty * it.rate, 0)
  const gst = Math.round(subtotal * GST_RATE)
  const total = subtotal + gst
  const balance = invoice.amount - invoice.paid

  return (
    <div>
      <PageHeader
        title={
          <button onClick={() => navigate('/billing/invoices')} className="flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Invoices
          </button>
        }
        subtitle={null}
        actions={
          <>
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" icon={Download} onClick={handleDownload}>Download</Button>
            {balance > 0 && allowRecordPayment && <Button icon={IndianRupee} onClick={openPayModal}>Record Payment</Button>}
          </>
        }
      />
      <PageBody>
        <Card className="mx-auto max-w-3xl print:border-0 print:shadow-none" padded={false}>
          <div className="p-8 sm:p-10">
            {/* Branding header */}
            <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <LogoMark className="h-12 w-12 shrink-0" />
                <div>
                  <p className="text-lg font-bold tracking-tight text-ink font-[Inter_Tight]">{company.name}</p>
                  <p className="text-xs text-ink-muted">{company.legalName}</p>
                  <p className="mt-1 text-xs text-ink-faint">{company.address}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <h2 className="text-2xl font-bold uppercase tracking-tight text-ink font-[Inter_Tight]">Tax Invoice</h2>
                <p className="mt-1 text-sm font-medium text-ink">{invoice.id}</p>
                <div className="mt-2"><StatusBadge status={invoice.status} /></div>
              </div>
            </div>

            {/* Bill To + meta */}
            <div className="grid grid-cols-1 gap-6 border-b border-border py-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Bill To</p>
                <p className="mt-2 text-sm font-semibold text-ink">{client?.name || 'Unknown Client'}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{client?.city}</p>
                <p className="text-xs text-ink-muted">{client?.email}</p>
                <p className="text-xs text-ink-muted">{client?.contact}</p>
                {client?.gstin && <p className="mt-1 text-xs text-ink-faint">GSTIN: {client.gstin}</p>}
              </div>
              <div className="sm:text-right">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:inline-grid">
                  <span className="text-ink-faint">Invoice Date</span>
                  <span className="font-medium text-ink">{formatDate(invoice.date)}</span>
                  <span className="text-ink-faint">Due Date</span>
                  <span className="font-medium text-ink">{formatDate(invoice.dueDate)}</span>
                  <span className="text-ink-faint">Project</span>
                  <span className="font-medium text-ink">{project?.name || 'Unknown Project'}</span>
                  <span className="text-ink-faint">Project Code</span>
                  <span className="font-medium text-ink">{project?.code || '—'}</span>
                  <span className="text-ink-faint">Our GSTIN</span>
                  <span className="font-medium text-ink">{company.gstin}</span>
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="py-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-ink-muted">
                      <th className="py-2 pr-3 font-medium">Description</th>
                      <th className="py-2 px-3 font-medium text-right">Qty</th>
                      <th className="py-2 px-3 font-medium text-right">Rate</th>
                      <th className="py-2 pl-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={i} className="border-b border-border-subtle last:border-0">
                        <td className="py-3 pr-3 text-ink">{it.desc}</td>
                        <td className="py-3 px-3 text-right text-ink-muted">{it.qty}</td>
                        <td className="py-3 px-3 text-right text-ink-muted">{formatCurrency(it.rate)}</td>
                        <td className="py-3 pl-3 text-right font-medium text-ink">{formatCurrency(it.qty * it.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="w-full max-w-xs space-y-2 text-sm">
                  <div className="flex justify-between text-ink-muted">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>GST (18%)</span>
                    <span>{formatCurrency(gst)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-ink">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Amount Paid</span>
                    <span>{formatCurrency(invoice.paid)}</span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-surface-subtle px-3 py-2 text-sm font-bold text-ink">
                    <span>Balance Due</span>
                    <span>{formatCurrency(balance)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms + footer */}
            <div className="border-t border-border pt-6 text-xs text-ink-muted">
              <p className="font-semibold text-ink-faint">Payment Terms & Instructions</p>
              <p className="mt-1.5">Payment is due within 30 days of the invoice date. Please make payment via bank transfer, cheque or UPI to {company.legalName}, quoting the invoice number {invoice.id} as reference. A late payment charge of 1.5% per month may apply on overdue balances.</p>
              <div className="mt-5 flex flex-col gap-1 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p>This is a system-generated invoice and does not require a signature.</p>
                <div className="flex items-center gap-3 text-ink-faint">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{company.email}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{company.phone}</span>
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{company.website}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </PageBody>

      <Modal
        open={payModal && allowRecordPayment}
        onClose={() => setPayModal(false)}
        title="Record Payment"
        description={`Balance due: ${formatCurrency(balance)}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSubmit(onRecordPayment)}>Record Payment</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onRecordPayment)}>
          <Field label="Amount Received (₹)" required error={errors.amount?.message}>
            <Input type="number" {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Amount must be greater than 0' }, max: { value: balance, message: `Cannot exceed balance of ${formatCurrency(balance)}` } })} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
