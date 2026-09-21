import { EntityListPage } from '../../components/patterns/EntityListPage'
import { StatusBadge } from '../../components/ui/Badge'
import { billingApi } from '../../api/billingApi'
import { customers, getCustomerName } from '../../data/customers'
import { invoices } from '../../data/invoices'
import { formatCurrency, formatDate } from '../../utils/format'

const STATUSES = ['issued', 'approved', 'cancelled']

export default function DebitNotes() {
  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'client', header: 'Client', render: (d) => getCustomerName(d.client) },
    { key: 'invoice', header: 'Invoice Ref' },
    { key: 'amount', header: 'Amount', sortable: true, render: (d) => formatCurrency(d.amount, { compact: true }) },
    { key: 'date', header: 'Date', sortable: true, render: (d) => formatDate(d.date) },
    { key: 'reason', header: 'Reason' },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} /> },
  ]

  return (
    <EntityListPage
      permissionModule="billing"
      title="Debit Notes"
      subtitle="Additional charges billed against client invoices"
      api={billingApi.debitNotes}
      columns={columns}
      filters={[{ key: 'status', label: 'Status', options: STATUSES }]}
      formFields={[
        { name: 'client', label: 'Client', type: 'select', required: true, options: customers.map((c) => ({ value: c.id, label: c.name })) },
        { name: 'invoice', label: 'Invoice', type: 'select', required: true, options: invoices.map((i) => ({ value: i.id, label: i.id })) },
        { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'reason', label: 'Reason', type: 'textarea', placeholder: 'Reason for issuing this debit note…' },
        { name: 'status', label: 'Status', type: 'select', required: true, options: STATUSES },
      ]}
      defaultValues={{ client: customers[0]?.id, invoice: invoices[0]?.id, status: 'issued', date: new Date().toISOString().slice(0, 10) }}
      searchPlaceholder="Search debit notes…"
      emptyStateTitle="No debit notes found"
      emptyStateDescription="Issue your first debit note to see it here."
      createLabel="New Debit Note"
    />
  )
}
