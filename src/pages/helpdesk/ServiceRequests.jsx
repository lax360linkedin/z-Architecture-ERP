import { EntityListPage } from '../../components/patterns/EntityListPage'
import { StatusBadge } from '../../components/ui/Badge'
import { helpdeskApi } from '../../api/helpdeskApi'
import { getCustomerName, customers } from '../../data/customers'
import { getProjectName, projects } from '../../data/projects'
import { formatDate } from '../../utils/format'

const serviceRequestStatuses = ['Open', 'In Progress', 'Resolved', 'Closed']
const serviceRequestTypes = ['Design Change Request', 'Additional Site Visit', 'Documentation Request', 'General Inquiry']

export default function ServiceRequests() {
  const columns = [
    { key: 'customer', header: 'Customer', sortable: true, render: (r) => getCustomerName(r.customer) },
    { key: 'type', header: 'Type', render: (r) => r.type },
    { key: 'project', header: 'Project', render: (r) => (r.project ? getProjectName(r.project) : '—') },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'raisedDate', header: 'Raised Date', sortable: true, render: (r) => formatDate(r.raisedDate) },
  ]

  return (
    <EntityListPage
      permissionModule="helpdesk"
      title="Service Requests"
      subtitle="Client-raised service and change requests"
      api={helpdeskApi.serviceRequests}
      columns={columns}
      searchPlaceholder="Search service requests…"
      filters={[{ key: 'status', label: 'Status', options: serviceRequestStatuses }]}
      emptyStateTitle="No service requests found"
      emptyStateDescription="Log a new service request to get started."
      createLabel="New Request"
      defaultValues={{ customer: customers[0]?.id || '', type: serviceRequestTypes[0], project: '', status: 'Open', raisedDate: '' }}
      formFields={[
        { name: 'customer', label: 'Customer', type: 'select', required: true, options: customers.map((c) => ({ value: c.id, label: c.name })) },
        { name: 'type', label: 'Type', type: 'select', required: true, options: serviceRequestTypes },
        { name: 'project', label: 'Project', type: 'select', options: projects.map((p) => ({ value: p.id, label: p.name })) },
        { name: 'status', label: 'Status', type: 'select', options: serviceRequestStatuses },
        { name: 'raisedDate', label: 'Raised Date', type: 'date', required: true },
      ]}
    />
  )
}
