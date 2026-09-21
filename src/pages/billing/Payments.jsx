import { EntityListPage } from '../../components/patterns/EntityListPage'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { billingApi } from '../../api/billingApi'
import { customers, getCustomerName } from '../../data/customers'
import { invoices } from '../../data/invoices'
import { formatCurrency, formatDate } from '../../utils/format'

const MODES = ['Bank Transfer', 'Cheque', 'UPI', 'Cash', 'Card']
const STATUSES = ['cleared', 'pending', 'failed']

export default function Payments() {
  const columns = [
    { key: 'id', header: 'Payment ID', sortable: true },
    { key: 'invoice', header: 'Invoice Ref' },
    { key: 'client', header: 'Client', render: (p) => getCustomerName(p.client) },
    { key: 'amount', header: 'Amount', sortable: true, render: (p) => formatCurrency(p.amount, { compact: true }) },
    { key: 'date', header: 'Date', sortable: true, render: (p) => formatDate(p.date) },
    { key: 'mode', header: 'Mode', render: (p) => <Badge color="brand">{p.mode}</Badge> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  ]

  return (
    <EntityListPage
      permissionModule="billing"
      title="Payments"
      subtitle="All payments received against client invoices"
      api={billingApi.payments}
      columns={columns}
      filters={[
        { key: 'mode', label: 'Modes', options: MODES },
        { key: 'status', label: 'Status', options: STATUSES },
      ]}
      formFields={[
        { name: 'client', label: 'Client', type: 'select', required: true, options: customers.map((c) => ({ value: c.id, label: c.name })) },
        { name: 'invoice', label: 'Invoice', type: 'select', required: true, options: invoices.map((i) => ({ value: i.id, label: i.id })) },
        { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
        { name: 'date', label: 'Payment Date', type: 'date', required: true },
        { name: 'mode', label: 'Payment Mode', type: 'select', required: true, options: MODES },
        { name: 'status', label: 'Status', type: 'select', required: true, options: STATUSES },
      ]}
      defaultValues={{ client: customers[0]?.id, invoice: invoices[0]?.id, mode: 'Bank Transfer', status: 'cleared', date: new Date().toISOString().slice(0, 10) }}
      searchPlaceholder="Search payments…"
      emptyStateTitle="No payments found"
      emptyStateDescription="Record your first payment to see it here."
      createLabel="New Payment"
    />
  )
}
