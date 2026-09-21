export const timesheets = [
  { id: 'TS-3001', employee: 'EMP-002', project: 'PRJ-2024-001', task: 'Design Development', date: '2024-09-16', hours: 6, billable: true, description: 'Roof deck detailing review' },
  { id: 'TS-3002', employee: 'EMP-002', project: 'PRJ-2024-002', task: 'Structural Coordination', date: '2024-09-16', hours: 2, billable: true, description: 'Coordination call with structural team' },
  { id: 'TS-3003', employee: 'EMP-011', project: 'PRJ-2024-001', task: 'Site Supervision', date: '2024-09-17', hours: 8, billable: true, description: 'Waterproofing inspection' },
  { id: 'TS-3004', employee: 'EMP-009', project: 'PRJ-2024-005', task: 'Interior Design', date: '2024-09-17', hours: 5, billable: true, description: 'Furniture layout revisions' },
  { id: 'TS-3005', employee: 'EMP-009', project: 'PRJ-2024-008', task: 'Concept Design', date: '2024-09-17', hours: 3, billable: true, description: 'Material palette exploration' },
  { id: 'TS-3006', employee: 'EMP-006', project: 'PRJ-2024-002', task: 'Structural Coordination', date: '2024-09-18', hours: 7, billable: true, description: 'Transfer beam clash resolution' },
  { id: 'TS-3007', employee: 'EMP-023', project: null, task: 'Internal - IT Support', date: '2024-09-18', hours: 4, billable: false, description: 'ERP rollout support' },
  { id: 'TS-3008', employee: 'EMP-016', project: null, task: 'Internal - HR Operations', date: '2024-09-18', hours: 6, billable: false, description: 'Recruitment drive coordination' },
  { id: 'TS-3009', employee: 'EMP-019', project: 'PRJ-2024-006', task: 'Master Planning', date: '2024-09-19', hours: 8, billable: true, description: 'Topographic survey validation' },
  { id: 'TS-3010', employee: 'EMP-012', project: 'PRJ-2024-004', task: 'Site Supervision', date: '2024-09-19', hours: 8, billable: true, description: 'Foundation pour supervision - Tower A' },
]

export function timesheetSummary(list = timesheets) {
  const total = list.reduce((s, t) => s + t.hours, 0)
  const billable = list.filter((t) => t.billable).reduce((s, t) => s + t.hours, 0)
  return { total, billable, nonBillable: total - billable }
}
