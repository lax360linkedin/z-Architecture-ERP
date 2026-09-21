import { EntityListPage } from '../../components/patterns/EntityListPage'
import { inventoryApi } from '../../api/inventoryApi'
import { itemCategories, warehouses, getWarehouseName } from '../../data/inventory'
import { StatusBadge } from '../../components/ui/Badge'
import { formatCurrency } from '../../utils/format'

export default function Items() {
  const columns = [
    { key: 'sku', header: 'SKU', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'category', header: 'Category' },
    { key: 'warehouse', header: 'Warehouse', render: (r) => getWarehouseName(r.warehouse) },
    { key: 'quantity', header: 'Quantity', sortable: true, render: (r) => `${r.quantity} ${r.unit}` },
    { key: 'reorderLevel', header: 'Reorder Level', render: (r) => `${r.reorderLevel} ${r.unit}` },
    { key: 'unitCost', header: 'Unit Cost', render: (r) => formatCurrency(r.unitCost) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <EntityListPage
      permissionModule="inventory"
      title="Inventory Items"
      subtitle="Materials and stock items across all warehouses"
      api={inventoryApi.items}
      columns={columns}
      searchPlaceholder="Search items by name, SKU, category…"
      filters={[
        { key: 'category', label: 'Categories', options: itemCategories },
        { key: 'status', label: 'Status', options: ['in-stock', 'low-stock', 'out-of-stock'] },
      ]}
      formFields={[
        { name: 'sku', label: 'SKU', type: 'text', required: true },
        { name: 'name', label: 'Item Name', type: 'text', required: true },
        { name: 'category', label: 'Category', type: 'select', required: true, options: itemCategories },
        { name: 'unit', label: 'Unit', type: 'text', placeholder: 'Bag, Ton, Piece…', required: true },
        { name: 'warehouse', label: 'Warehouse', type: 'select', required: true, options: warehouses.map((w) => ({ value: w.id, label: w.name })) },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'reorderLevel', label: 'Reorder Level', type: 'number', required: true },
        { name: 'unitCost', label: 'Unit Cost (₹)', type: 'number', required: true },
        { name: 'status', label: 'Status', type: 'select', required: true, options: ['in-stock', 'low-stock', 'out-of-stock'] },
      ]}
      defaultValues={{ status: 'in-stock', category: itemCategories[0] }}
      createLabel="New Item"
    />
  )
}
