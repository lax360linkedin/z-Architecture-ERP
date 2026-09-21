import { EntityListPage } from '../../components/patterns/EntityListPage'
import { procurementApi } from '../../api/procurementApi'
import { getProjectName, projects } from '../../data/projects'
import { getEmployeeName, employees } from '../../data/employees'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { formatDate } from '../../utils/format'

const WORKFLOW_STEPS = ['Request', 'Approval', 'RFQ', 'Quotations', 'Comparison', 'PO', 'Receipt', 'Invoice', 'Payment']

function ProcurementWorkflowBanner({ current }) {
  const idx = WORKFLOW_STEPS.indexOf(current)
  return (
    <div className="mb-4 flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-surface-raised px-4 py-3">
      {WORKFLOW_STEPS.map((step, i) => (
        <div key={step} className="flex shrink-0 items-center">
          <span
            className={
              i === idx
                ? 'rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white'
                : i < idx
                ? 'rounded-md bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'rounded-md px-2.5 py-1 text-xs font-medium text-ink-faint'
            }
          >
            {step}
          </span>
          {i < WORKFLOW_STEPS.length - 1 && <span className="mx-1 h-px w-4 shrink-0 bg-border" />}
        </div>
      ))}
    </div>
  )
}

const priorityColor = { low: 'neutral', medium: 'warning', high: 'danger' }

export default function PurchaseRequests() {
  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'item', header: 'Item' },
    { key: 'project', header: 'Project', render: (r) => getProjectName(r.project) },
    { key: 'quantity', header: 'Quantity', render: (r) => `${r.quantity} ${r.unit}` },
    { key: 'requestedBy', header: 'Requested By', render: (r) => getEmployeeName(r.requestedBy) },
    { key: 'date', header: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    { key: 'priority', header: 'Priority', render: (r) => <Badge color={priorityColor[r.priority] || 'neutral'}>{r.priority}</Badge> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <ProcurementWorkflowBanner current="Request" />
      </div>
      <EntityListPage
        permissionModule="procurement"
        title="Purchase Requests"
        subtitle="Material and service requests raised from project sites"
        api={procurementApi.requests}
        columns={columns}
        searchPlaceholder="Search purchase requests…"
        filters={[
          { key: 'status', label: 'Status', options: ['pending', 'approved', 'rejected', 'converted'] },
          { key: 'priority', label: 'Priority', options: ['low', 'medium', 'high'] },
        ]}
        formFields={[
          { name: 'project', label: 'Project', type: 'select', required: true, options: projects.map((p) => ({ value: p.id, label: p.name })) },
          { name: 'item', label: 'Item', type: 'text', required: true },
          { name: 'quantity', label: 'Quantity', type: 'number', required: true },
          { name: 'unit', label: 'Unit', type: 'text', placeholder: 'Ton, Sqft, Piece…', required: true },
          { name: 'requestedBy', label: 'Requested By', type: 'select', required: true, options: employees.map((e) => ({ value: e.id, label: e.name })) },
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'priority', label: 'Priority', type: 'select', required: true, options: ['low', 'medium', 'high'] },
          { name: 'status', label: 'Status', type: 'select', required: true, options: ['pending', 'approved', 'rejected', 'converted'] },
        ]}
        defaultValues={{ status: 'pending', priority: 'medium', date: new Date().toISOString().slice(0, 10) }}
        createLabel="New Purchase Request"
      />
    </div>
  )
}

export { ProcurementWorkflowBanner, WORKFLOW_STEPS }
