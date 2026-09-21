import { EntityListPage } from '../../components/patterns/EntityListPage'
import { procurementApi } from '../../api/procurementApi'
import { purchaseOrders } from '../../data/procurement'
import { employees, getEmployeeName } from '../../data/employees'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { formatDate } from '../../utils/format'
import { ProcurementWorkflowBanner } from './PurchaseRequests'

const conditionColor = { good: 'success', damaged: 'danger', partial: 'warning' }

export default function GoodsReceipt() {
  const columns = [
    { key: 'id', header: 'GRN ID', sortable: true },
    { key: 'po', header: 'PO Ref' },
    { key: 'receivedDate', header: 'Received Date', sortable: true, render: (r) => formatDate(r.receivedDate) },
    { key: 'receivedBy', header: 'Received By', render: (r) => getEmployeeName(r.receivedBy) },
    { key: 'quantity', header: 'Quantity' },
    { key: 'condition', header: 'Condition', render: (r) => <Badge color={conditionColor[r.condition] || 'neutral'}>{r.condition}</Badge> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <ProcurementWorkflowBanner current="Receipt" />
      </div>
      <EntityListPage
        permissionModule="procurement"
        title="Goods Receipt"
        subtitle="Goods Receipt Notes (GRN) for materials delivered against POs"
        api={procurementApi.goodsReceipts}
        columns={columns}
        searchPlaceholder="Search GRNs…"
        filters={[
          { key: 'status', label: 'Status', options: ['pending', 'completed'] },
          { key: 'condition', label: 'Condition', options: ['good', 'damaged', 'partial'] },
        ]}
        formFields={[
          { name: 'po', label: 'Purchase Order', type: 'select', required: true, options: purchaseOrders.map((p) => ({ value: p.id, label: `${p.id} — ${p.item}` })) },
          { name: 'receivedDate', label: 'Received Date', type: 'date', required: true },
          { name: 'receivedBy', label: 'Received By', type: 'select', required: true, options: employees.map((e) => ({ value: e.id, label: e.name })) },
          { name: 'quantity', label: 'Quantity', type: 'number', required: true },
          { name: 'condition', label: 'Condition', type: 'select', required: true, options: ['good', 'damaged', 'partial'] },
          { name: 'status', label: 'Status', type: 'select', required: true, options: ['pending', 'completed'] },
        ]}
        defaultValues={{ condition: 'good', status: 'completed', receivedDate: new Date().toISOString().slice(0, 10) }}
        createLabel="New GRN"
      />
    </div>
  )
}
