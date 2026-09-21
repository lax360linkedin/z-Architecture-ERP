import { EntityListPage } from '../../components/patterns/EntityListPage'
import { procurementApi } from '../../api/procurementApi'
import { vendors, getVendorName } from '../../data/vendors'
import { projects, getProjectName } from '../../data/projects'
import { StatusBadge } from '../../components/ui/Badge'
import { formatCurrency, formatDate } from '../../utils/format'
import { ProcurementWorkflowBanner } from './PurchaseRequests'

export default function PurchaseOrders() {
  const columns = [
    { key: 'id', header: 'PO ID', sortable: true },
    { key: 'vendor', header: 'Vendor', render: (r) => getVendorName(r.vendor) },
    { key: 'project', header: 'Project', render: (r) => getProjectName(r.project) },
    { key: 'item', header: 'Item' },
    {
      key: 'total', header: 'Qty × Rate = Total', sortable: false, render: (r) => (
        <span>
          {r.quantity} × {formatCurrency(r.rate, { compact: true })} = <span className="font-semibold">{formatCurrency(r.quantity * r.rate, { compact: true })}</span>
        </span>
      ),
    },
    { key: 'deliveryDate', header: 'Delivery Date', sortable: true, render: (r) => formatDate(r.deliveryDate) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <ProcurementWorkflowBanner current="PO" />
      </div>
      <EntityListPage
        permissionModule="procurement"
        title="Purchase Orders"
        subtitle="Purchase orders issued to vendors"
        api={procurementApi.purchaseOrders}
        columns={columns}
        searchPlaceholder="Search purchase orders…"
        filters={[{ key: 'status', label: 'Status', options: ['approved', 'in-progress', 'delivered'] }]}
        formFields={[
          { name: 'vendor', label: 'Vendor', type: 'select', required: true, options: vendors.map((v) => ({ value: v.id, label: v.name })) },
          { name: 'project', label: 'Project', type: 'select', required: true, options: projects.map((p) => ({ value: p.id, label: p.name })) },
          { name: 'item', label: 'Item', type: 'text', required: true },
          { name: 'quantity', label: 'Quantity', type: 'number', required: true },
          { name: 'unit', label: 'Unit', type: 'text', required: true },
          { name: 'rate', label: 'Rate (₹)', type: 'number', required: true },
          { name: 'date', label: 'PO Date', type: 'date', required: true },
          { name: 'deliveryDate', label: 'Delivery Date', type: 'date', required: true },
          { name: 'status', label: 'Status', type: 'select', required: true, options: ['approved', 'in-progress', 'delivered'] },
        ]}
        defaultValues={{ status: 'approved', date: new Date().toISOString().slice(0, 10) }}
        createLabel="New Purchase Order"
      />
    </div>
  )
}
