import { ArrowRight } from 'lucide-react'
import { EntityListPage } from '../../components/patterns/EntityListPage'
import { inventoryApi } from '../../api/inventoryApi'
import { items, warehouses, getItemById, getWarehouseName } from '../../data/inventory'
import { employees, getEmployeeName } from '../../data/employees'
import { StatusBadge } from '../../components/ui/Badge'
import { formatDate } from '../../utils/format'

export default function StockTransfer() {
  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'item', header: 'Item', render: (r) => getItemById(r.item)?.name || 'Unknown Item' },
    {
      key: 'route', header: 'From → To', render: (r) => (
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          {getWarehouseName(r.from)} <ArrowRight className="h-3.5 w-3.5 text-ink-faint" /> {getWarehouseName(r.to)}
        </span>
      ),
    },
    { key: 'quantity', header: 'Quantity' },
    { key: 'date', header: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'requestedBy', header: 'Requested By', render: (r) => getEmployeeName(r.requestedBy) },
  ]

  return (
    <EntityListPage
      permissionModule="inventory"
      title="Stock Transfer"
      subtitle="Inter-warehouse material transfers"
      api={inventoryApi.transfers}
      columns={columns}
      searchPlaceholder="Search transfers…"
      filters={[{ key: 'status', label: 'Status', options: ['pending', 'in-transit', 'completed'] }]}
      formFields={[
        { name: 'item', label: 'Item', type: 'select', required: true, options: items.map((i) => ({ value: i.id, label: i.name })) },
        { name: 'from', label: 'From Warehouse', type: 'select', required: true, options: warehouses.map((w) => ({ value: w.id, label: w.name })) },
        { name: 'to', label: 'To Warehouse', type: 'select', required: true, options: warehouses.map((w) => ({ value: w.id, label: w.name })) },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'status', label: 'Status', type: 'select', required: true, options: ['pending', 'in-transit', 'completed'] },
        { name: 'requestedBy', label: 'Requested By', type: 'select', required: true, options: employees.map((e) => ({ value: e.id, label: e.name })) },
      ]}
      defaultValues={{ status: 'pending', date: new Date().toISOString().slice(0, 10) }}
      createLabel="New Transfer"
    />
  )
}
