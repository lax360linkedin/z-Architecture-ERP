import { EntityListPage } from '../../components/patterns/EntityListPage'
import { StatusBadge } from '../../components/ui/Badge'
import { siteApi } from '../../api/siteApi'
import { getEmployeeName, employees } from '../../data/employees'
import { getProjectName, projects } from '../../data/projects'
import { formatDate } from '../../utils/format'

export default function SiteVisits() {
  const columns = [
    { key: 'project', header: 'Project', sortable: true, render: (v) => getProjectName(v.project) },
    { key: 'visitor', header: 'Visitor', render: (v) => getEmployeeName(v.visitor) },
    { key: 'purpose', header: 'Purpose', render: (v) => <span className="text-ink-muted">{v.purpose}</span> },
    { key: 'date', header: 'Date', sortable: true, render: (v) => formatDate(v.date) },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status} /> },
  ]

  const formFields = [
    { name: 'project', label: 'Project', type: 'select', required: true, options: projects.map((p) => ({ value: p.id, label: p.name })) },
    { name: 'visitor', label: 'Visitor', type: 'select', required: true, options: employees.map((e) => ({ value: e.id, label: e.name })) },
    { name: 'purpose', label: 'Purpose', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [{ value: 'scheduled', label: 'Scheduled' }, { value: 'completed', label: 'Completed' }] },
  ]

  return (
    <EntityListPage
      permissionModule="site"
      title="Site Visits"
      subtitle="Scheduled and completed visits across project sites"
      api={siteApi.visits}
      columns={columns}
      filters={[{ key: 'status', label: 'Status', options: ['scheduled', 'completed'] }]}
      formFields={formFields}
      searchPlaceholder="Search visits…"
      emptyStateTitle="No site visits found"
      emptyStateDescription="Schedule a site visit to see it listed here."
      createLabel="New Visit"
      defaultValues={{ project: projects[0]?.id, visitor: employees[0]?.id, status: 'scheduled', date: new Date().toISOString().slice(0, 10) }}
    />
  )
}
