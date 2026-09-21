import { EntityListPage } from '../../components/patterns/EntityListPage'
import { adminApi } from '../../api/adminApi'
import { employees, getEmployeeName } from '../../data/employees'
import { StatusBadge } from '../../components/ui/Badge'

export default function Branches() {
  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'city', header: 'City', sortable: true },
    { key: 'manager', header: 'Manager', render: (r) => getEmployeeName(r.manager) },
    { key: 'employees', header: 'Employees', sortable: true, render: (r) => r.employees },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <EntityListPage
      permissionModule="administration"
      title="Branches"
      subtitle="Office locations and regional teams"
      api={adminApi.branches}
      columns={columns}
      searchPlaceholder="Search branches…"
      filters={[{ key: 'status', label: 'Status', options: ['active', 'inactive'] }]}
      formFields={[
        { name: 'name', label: 'Branch Name', type: 'text', required: true },
        { name: 'city', label: 'City', type: 'text', required: true },
        { name: 'manager', label: 'Manager', type: 'select', required: true, options: employees.map((e) => ({ value: e.id, label: e.name })) },
        { name: 'employees', label: 'Employee Count', type: 'number', required: true },
        { name: 'status', label: 'Status', type: 'select', required: true, options: ['active', 'inactive'] },
      ]}
      defaultValues={{ status: 'active', employees: 1 }}
      createLabel="New Branch"
    />
  )
}
