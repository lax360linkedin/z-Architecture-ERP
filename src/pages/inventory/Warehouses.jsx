import { EntityListPage } from '../../components/patterns/EntityListPage'
import { inventoryApi } from '../../api/inventoryApi'
import { employees, getEmployeeName } from '../../data/employees'
import { StatusBadge, Badge } from '../../components/ui/Badge'

const WAREHOUSE_TYPES = ['Material Yard', 'Site Store', 'Regional Store', 'Central Warehouse']

export default function Warehouses() {
  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'location', header: 'Location' },
    { key: 'manager', header: 'Manager', render: (r) => getEmployeeName(r.manager) },
    { key: 'type', header: 'Type', render: (r) => <Badge>{r.type}</Badge> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <EntityListPage
      permissionModule="inventory"
      title="Warehouses"
      subtitle="Material yards and stores across your project locations"
      api={inventoryApi.warehouses}
      columns={columns}
      searchPlaceholder="Search warehouses…"
      filters={[{ key: 'status', label: 'Status', options: ['active', 'inactive'] }]}
      formFields={[
        { name: 'name', label: 'Warehouse Name', type: 'text', required: true },
        { name: 'location', label: 'Location', type: 'text', required: true },
        { name: 'manager', label: 'Manager', type: 'select', required: true, options: employees.map((e) => ({ value: e.id, label: e.name })) },
        { name: 'type', label: 'Type', type: 'select', required: true, options: WAREHOUSE_TYPES },
        { name: 'status', label: 'Status', type: 'select', required: true, options: ['active', 'inactive'] },
      ]}
      defaultValues={{ status: 'active', type: WAREHOUSE_TYPES[0] }}
      createLabel="New Warehouse"
    />
  )
}
