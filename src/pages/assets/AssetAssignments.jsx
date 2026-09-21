import { EntityListPage } from '../../components/patterns/EntityListPage'
import { StatusBadge } from '../../components/ui/Badge'
import { assetApi } from '../../api/assetApi'
import { assets } from '../../data/assets'
import { getEmployeeName, employees } from '../../data/employees'
import { formatDate } from '../../utils/format'

const assignmentStatuses = ['active', 'returned']

export default function AssetAssignments() {
  const columns = [
    { key: 'asset', header: 'Asset', sortable: true, render: (r) => assets.find((a) => a.id === r.asset)?.name || r.asset },
    { key: 'employee', header: 'Employee', render: (r) => getEmployeeName(r.employee) },
    { key: 'assignedDate', header: 'Assigned Date', sortable: true, render: (r) => formatDate(r.assignedDate) },
    { key: 'returnDate', header: 'Return Date', render: (r) => (r.returnDate ? formatDate(r.returnDate) : 'Active') },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <EntityListPage
      permissionModule="assets"
      title="Asset Assignments"
      subtitle="Track which employee currently holds which asset"
      api={assetApi.assignments}
      columns={columns}
      searchPlaceholder="Search assignments…"
      filters={[{ key: 'status', label: 'Status', options: assignmentStatuses }]}
      emptyStateTitle="No assignments found"
      emptyStateDescription="Assign an asset to an employee to get started."
      createLabel="New Assignment"
      defaultValues={{ asset: assets[0]?.id || '', employee: employees[0]?.id || '', assignedDate: '', returnDate: '', status: 'active' }}
      formFields={[
        { name: 'asset', label: 'Asset', type: 'select', required: true, options: assets.map((a) => ({ value: a.id, label: a.name })) },
        { name: 'employee', label: 'Employee', type: 'select', required: true, options: employees.map((e) => ({ value: e.id, label: e.name })) },
        { name: 'assignedDate', label: 'Assigned Date', type: 'date', required: true },
        { name: 'returnDate', label: 'Return Date', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: assignmentStatuses },
      ]}
    />
  )
}
