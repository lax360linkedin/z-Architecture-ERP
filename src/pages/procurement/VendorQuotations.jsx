import { useMemo } from 'react'
import { Trophy } from 'lucide-react'
import { EntityListPage } from '../../components/patterns/EntityListPage'
import { procurementApi } from '../../api/procurementApi'
import { vendorQuotations, rfqs } from '../../data/procurement'
import { getVendorName, vendors } from '../../data/vendors'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { classNames, formatCurrency, formatDate } from '../../utils/format'
import { ProcurementWorkflowBanner } from './PurchaseRequests'

function QuotationComparison() {
  const groups = useMemo(() => {
    const byRfq = {}
    vendorQuotations.forEach((q) => {
      if (!byRfq[q.rfq]) byRfq[q.rfq] = []
      byRfq[q.rfq].push(q)
    })
    return Object.entries(byRfq).filter(([, list]) => list.length >= 2)
  }, [])

  if (groups.length === 0) return null

  return (
    <div className="mb-5 flex flex-col gap-4">
      {groups.map(([rfqId, quotes]) => {
        const rfq = rfqs.find((r) => r.id === rfqId)
        const lowest = Math.min(...quotes.map((q) => q.amount))
        return (
          <Card key={rfqId}>
            <CardHeader title={`Quotation Comparison — ${rfqId}`} subtitle={rfq?.item || 'RFQ package'} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quotes.map((q) => {
                const isLowest = q.amount === lowest
                return (
                  <div
                    key={q.id}
                    className={classNames(
                      'rounded-xl border p-4',
                      isLowest ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30' : 'border-border'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink">{getVendorName(q.vendor)}</p>
                      {isLowest && (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <Trophy className="h-3.5 w-3.5" /> Lowest
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xl font-bold tracking-tight text-ink font-[Inter_Tight]">{formatCurrency(q.amount, { compact: true })}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
                      <span>Delivery in {q.deliveryDays}d</span>
                      <span>Valid till {formatDate(q.validity)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default function VendorQuotations() {
  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'rfq', header: 'RFQ Ref' },
    { key: 'vendor', header: 'Vendor', render: (r) => getVendorName(r.vendor) },
    { key: 'amount', header: 'Amount', sortable: true, render: (r) => formatCurrency(r.amount, { compact: true }) },
    { key: 'deliveryDays', header: 'Delivery Days', render: (r) => `${r.deliveryDays} days` },
    { key: 'validity', header: 'Validity', render: (r) => formatDate(r.validity) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <ProcurementWorkflowBanner current="Quotations" />
        <QuotationComparison />
      </div>
      <EntityListPage
        permissionModule="procurement"
        title="Vendor Quotations"
        subtitle="Quotations received against open RFQs"
        api={procurementApi.vendorQuotations}
        columns={columns}
        searchPlaceholder="Search quotations…"
        filters={[{ key: 'status', label: 'Status', options: ['received', 'shortlisted', 'rejected'] }]}
        formFields={[
          { name: 'rfq', label: 'RFQ', type: 'select', required: true, options: rfqs.map((r) => ({ value: r.id, label: `${r.id} — ${r.item}` })) },
          { name: 'vendor', label: 'Vendor', type: 'select', required: true, options: vendors.map((v) => ({ value: v.id, label: v.name })) },
          { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
          { name: 'deliveryDays', label: 'Delivery (days)', type: 'number', required: true },
          { name: 'validity', label: 'Valid Until', type: 'date', required: true },
          { name: 'status', label: 'Status', type: 'select', required: true, options: ['received', 'shortlisted', 'rejected'] },
        ]}
        defaultValues={{ status: 'received' }}
        createLabel="New Quotation"
      />
    </div>
  )
}
