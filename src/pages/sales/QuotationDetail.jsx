import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Printer, Download, CheckCircle2, XCircle, Send, MapPin, Mail, Phone } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { PageLoader } from '../../components/layout/PageLoader'
import { LogoMark } from '../../components/layout/Logo'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { salesApi } from '../../api/salesApi'
import { getCustomerById } from '../../data/customers'
import { getProjectById } from '../../data/projects'
import { getEmployeeName } from '../../data/employees'
import { formatCurrency, formatDate } from '../../utils/format'
import { usePermissions } from '../../context/PermissionContext'

export default function QuotationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = usePermissions()
  const allowEdit = can('sales', 'edit')
  const allowApprove = can('sales', 'approve')
  const [loading, setLoading] = useState(true)
  const [quotation, setQuotation] = useState(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true)
    const q = await salesApi.quotations.get(id)
    setQuotation(q)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function setStatus(status, message) {
    setBusy(true)
    try {
      await salesApi.quotations.update(id, { status })
      toast.success(message)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to update quotation')
    } finally {
      setBusy(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleDownload() {
    toast.success('Quotation ready for download')
  }

  if (loading) return <PageLoader />

  if (!quotation) {
    return (
      <div>
        <PageHeader title="Quotation not found" actions={<Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/sales/quotations')}>Back</Button>} />
        <PageBody><EmptyState title="This quotation doesn't exist" description="It may have been removed." /></PageBody>
      </div>
    )
  }

  const client = getCustomerById(quotation.client)
  const project = getProjectById(quotation.project)
  const totals = salesApi.quotationTotals(quotation)

  return (
    <div>
      <PageHeader
        title={
          <button onClick={() => navigate('/sales/quotations')} className="flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Quotations
          </button>
        }
        subtitle={null}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint}>Print</Button>
            <Button variant="secondary" size="sm" icon={Download} onClick={handleDownload}>Download</Button>
            {allowEdit && quotation.status !== 'sent' && quotation.status !== 'approved' && (
              <Button variant="secondary" size="sm" icon={Send} loading={busy} onClick={() => setStatus('sent', 'Quotation sent to client')}>Send</Button>
            )}
            {allowApprove && quotation.status !== 'approved' && (
              <Button variant="secondary" size="sm" icon={CheckCircle2} loading={busy} onClick={() => setStatus('approved', 'Quotation approved')}>Approve</Button>
            )}
            {allowApprove && quotation.status !== 'rejected' && (
              <Button variant="danger" size="sm" icon={XCircle} loading={busy} onClick={() => setStatus('rejected', 'Quotation rejected')}>Reject</Button>
            )}
          </>
        }
      />
      <PageBody>
        <Card className="mx-auto max-w-4xl print:border-0 print:shadow-none" padded={false}>
          <div className="p-8 sm:p-10">
            {/* Letterhead */}
            <div className="flex items-start justify-between border-b border-border pb-6">
              <div className="flex items-center gap-3">
                <LogoMark className="h-11 w-11" />
                <div>
                  <p className="text-lg font-bold tracking-tight text-ink font-[Inter_Tight]">LAX360 Architecture</p>
                  <p className="text-xs text-ink-faint">Design · Build · Deliver</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold tracking-tight text-ink font-[Inter_Tight]">QUOTATION</p>
                <p className="mt-1 text-sm text-ink-muted">{quotation.id}</p>
                <div className="mt-2"><StatusBadge status={quotation.status} /></div>
              </div>
            </div>

            {/* Client / Project details */}
            <div className="grid grid-cols-1 gap-6 border-b border-border py-6 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Billed To</p>
                <p className="mt-2 text-sm font-semibold text-ink">{client?.name || 'Unknown Client'}</p>
                {client && (
                  <div className="mt-1.5 space-y-1 text-xs text-ink-muted">
                    <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{client.city}</p>
                    <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{client.email}</p>
                    <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{client.contact}</p>
                    {client.gstin && <p>GSTIN: {client.gstin}</p>}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Project</p>
                <p className="mt-2 text-sm font-semibold text-ink">{project?.name || 'General'}</p>
                {project && <p className="mt-1.5 text-xs text-ink-muted">{project.location}</p>}
                <p className="mt-1.5 text-xs text-ink-muted">Prepared by {getEmployeeName(quotation.owner)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Details</p>
                <div className="mt-2 space-y-1 text-xs text-ink-muted">
                  <p>Quotation Date: <span className="font-medium text-ink">{formatDate(quotation.date)}</span></p>
                  <p>Valid Until: <span className="font-medium text-ink">{formatDate(quotation.validity)}</span></p>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="py-5">
              <p className="text-sm font-semibold text-ink">{quotation.title}</p>
            </div>

            {/* Items table */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-subtle text-xs text-ink-muted">
                    <th className="px-4 py-2.5 font-medium">#</th>
                    <th className="px-4 py-2.5 font-medium">Service / Item</th>
                    <th className="px-4 py-2.5 font-medium text-right">Qty</th>
                    <th className="px-4 py-2.5 font-medium">Unit</th>
                    <th className="px-4 py-2.5 font-medium text-right">Rate</th>
                    <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-border-subtle last:border-0">
                      <td className="px-4 py-2.5 text-ink-muted">{idx + 1}</td>
                      <td className="px-4 py-2.5 text-ink">{item.service}</td>
                      <td className="px-4 py-2.5 text-right text-ink-muted">{item.qty}</td>
                      <td className="px-4 py-2.5 text-ink-muted">{item.unit}</td>
                      <td className="px-4 py-2.5 text-right text-ink-muted">{formatCurrency(item.rate)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-ink">{formatCurrency(item.qty * item.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-5 flex justify-end">
              <div className="w-full max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between text-ink-muted"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
                <div className="flex justify-between text-ink-muted"><span>Discount ({quotation.discount || 0}%)</span><span>- {formatCurrency(totals.discountAmt)}</span></div>
                <div className="flex justify-between text-ink-muted"><span>GST ({quotation.tax || 0}%)</span><span>+ {formatCurrency(totals.taxAmt)}</span></div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-ink"><span>Total</span><span>{formatCurrency(totals.total)}</span></div>
              </div>
            </div>

            {/* Terms */}
            {quotation.terms && (
              <div className="mt-8 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Payment Terms</p>
                <p className="mt-2 text-sm text-ink-muted">{quotation.terms}</p>
              </div>
            )}

            <div className="mt-8 border-t border-border pt-5 text-xs text-ink-faint">
              This is a system-generated quotation from LAX360 Architecture ERP. Prices are valid until the date mentioned above.
            </div>
          </div>
        </Card>
      </PageBody>
    </div>
  )
}
