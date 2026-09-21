// `task` stays a free-text label for entries logged against general work;
// `taskId` links an entry to a real record in src/data/tasks.js when the
// hours were logged against a specific tracked task (Task ↔ Timesheet
// integration — see taskApi.logTime, which creates the entry AND adds the
// hours to that task's actualHours).
export const timesheets = [
  { id: 'TS-3001', employee: 'EMP-002', project: 'PRJ-2024-001', task: 'Design Development', taskId: 'TSK-5002', date: '2024-09-16', hours: 6, billable: true, description: 'Roof deck detailing review' },
  { id: 'TS-3002', employee: 'EMP-002', project: 'PRJ-2024-002', task: 'Structural Coordination', taskId: null, date: '2024-09-16', hours: 2, billable: true, description: 'Coordination call with structural team' },
  { id: 'TS-3003', employee: 'EMP-011', project: 'PRJ-2024-001', task: 'Site Supervision', taskId: 'TSK-5001', date: '2024-09-17', hours: 8, billable: true, description: 'Waterproofing inspection' },
  { id: 'TS-3004', employee: 'EMP-009', project: 'PRJ-2024-005', task: 'Interior Design', taskId: null, date: '2024-09-17', hours: 5, billable: true, description: 'Furniture layout revisions' },
  { id: 'TS-3005', employee: 'EMP-009', project: 'PRJ-2024-008', task: 'Concept Design', taskId: 'TSK-5202', date: '2024-09-17', hours: 3, billable: true, description: 'Material palette exploration' },
  { id: 'TS-3006', employee: 'EMP-006', project: 'PRJ-2024-002', task: 'Structural Coordination', taskId: 'TSK-5303', date: '2024-09-18', hours: 7, billable: true, description: 'Transfer beam clash resolution' },
  { id: 'TS-3007', employee: 'EMP-023', project: null, task: 'Internal - IT Support', taskId: 'TSK-5311', date: '2024-09-18', hours: 4, billable: false, description: 'ERP rollout support' },
  { id: 'TS-3008', employee: 'EMP-016', project: null, task: 'Internal - HR Operations', taskId: 'TSK-5307', date: '2024-09-18', hours: 6, billable: false, description: 'Recruitment drive coordination' },
  { id: 'TS-3009', employee: 'EMP-019', project: 'PRJ-2024-006', task: 'Master Planning', taskId: null, date: '2024-09-19', hours: 8, billable: true, description: 'Topographic survey validation' },
  { id: 'TS-3010', employee: 'EMP-012', project: 'PRJ-2024-004', task: 'Site Supervision', taskId: 'TSK-5305', date: '2024-09-19', hours: 8, billable: true, description: 'Foundation pour supervision - Tower A' },
]

export function timesheetSummary(list = timesheets) {
  const total = list.reduce((s, t) => s + t.hours, 0)
  const billable = list.filter((t) => t.billable).reduce((s, t) => s + t.hours, 0)
  return { total, billable, nonBillable: total - billable }
}
