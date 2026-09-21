// Unified Task Management data model. Previously the app kept two
// overlapping arrays (`wbsTasks` for the project/kanban views, `myTasks` for
// the personal view) — a duplicated version of the same underlying entity.
// They're consolidated into one `tasks` store here so every view (Task
// Dashboard, Task List, Kanban, Calendar, My Tasks, Project → Tasks) reads
// and writes the same records.

export const TASK_TYPES = [
  'Design Task', 'Drawing Task', 'Revision Task', 'BOQ Task', 'Estimation Task',
  'Client Approval Task', 'Procurement Task', 'Site Task', 'Inspection Task',
  'Documentation Task', 'Meeting Task', 'Finance Task', 'HR Task', 'General Task',
]

// Lifecycle: Not Started -> In Progress -> Review -> Approved -> Completed,
// with On Hold / Blocked / Cancelled as alternate states reachable from
// most points in the flow.
export const TASK_STATUSES = ['Not Started', 'In Progress', 'Review', 'Approved', 'Completed', 'On Hold', 'Blocked', 'Cancelled']
export const TASK_ACTIVE_STATUSES = ['Not Started', 'In Progress', 'Review', 'Approved']

export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

// Finish-to-Start (B can't start until A finishes), Start-to-Start (B can't
// start until A starts), Finish-to-Finish (B can't finish until A finishes).
export const DEPENDENCY_TYPES = [
  { value: 'FS', label: 'Finish-to-Start' },
  { value: 'SS', label: 'Start-to-Start' },
  { value: 'FF', label: 'Finish-to-Finish' },
]

export const milestones = [
  { id: 'MS-801', project: 'PRJ-2024-001', name: 'Foundation Complete', dueDate: '2024-04-30', status: 'completed', progress: 100 },
  { id: 'MS-802', project: 'PRJ-2024-001', name: 'Structure Topping Out', dueDate: '2024-09-30', status: 'in-progress', progress: 85 },
  { id: 'MS-803', project: 'PRJ-2024-001', name: 'Interior Finishing Start', dueDate: '2024-12-15', status: 'pending', progress: 0 },
  { id: 'MS-804', project: 'PRJ-2024-002', name: 'Basement Excavation Complete', dueDate: '2024-02-28', status: 'completed', progress: 100 },
  { id: 'MS-805', project: 'PRJ-2024-002', name: 'Podium Structure Complete', dueDate: '2024-10-31', status: 'in-progress', progress: 55 },
  { id: 'MS-806', project: 'PRJ-2024-002', name: 'Facade Installation Start', dueDate: '2025-01-15', status: 'pending', progress: 0 },
  { id: 'MS-807', project: 'PRJ-2024-003', name: 'Design Approval', dueDate: '2024-08-15', status: 'delayed', progress: 90 },
  { id: 'MS-808', project: 'PRJ-2024-004', name: 'Tower A Foundation', dueDate: '2024-10-15', status: 'in-progress', progress: 40 },
  { id: 'MS-809', project: 'PRJ-2024-008', name: 'Concept Design', dueDate: '2024-09-30', status: 'in-progress', progress: 67 },
]

function task(overrides) {
  return {
    description: '',
    milestone: null,
    parentTask: null,
    assignedDepartment: null,
    reviewer: null,
    estimatedHours: 8,
    actualHours: 0,
    approvalStatus: null,
    tags: [],
    checklist: [],
    dependencies: [],
    attachments: [],
    comments: [],
    activity: [],
    relatedDrawing: null,
    relatedPO: null,
    relatedInvoice: null,
    branchId: 'BR-01',
    createdDate: '2024-09-01',
    ...overrides,
  }
}

export const tasks = [
  // ---- Dependency chain demo: Site Measurement -> Floor Plan -> 3D Design -> Client Approval (Green Valley Residence) ----
  task({
    id: 'TSK-5001', title: 'Site Measurement', type: 'Site Task', project: 'PRJ-2024-001', milestone: 'MS-801',
    assignedTo: 'EMP-011', assignedDepartment: 'Site Execution', createdBy: 'EMP-004', reviewer: 'EMP-004',
    startDate: '2024-08-20', dueDate: '2024-08-25', estimatedHours: 12, actualHours: 11, priority: 'High', status: 'Completed', approvalStatus: 'approved',
    tags: ['site', 'survey'], createdDate: '2024-08-15',
    checklist: [
      { id: 'CL-1', text: 'Boundary measurements taken', done: true },
      { id: 'CL-2', text: 'Level survey completed', done: true },
      { id: 'CL-3', text: 'Photos uploaded', done: true },
    ],
    comments: [{ id: 'CM-1', author: 'EMP-011', text: 'All measurements cross-checked against the survey drawing.', time: '2024-08-25T10:00:00' }],
    activity: [
      { id: 'AC-1', action: 'created the task', user: 'EMP-004', time: '2024-08-15T09:00:00' },
      { id: 'AC-2', action: 'moved to In Progress', user: 'EMP-011', time: '2024-08-20T08:00:00' },
      { id: 'AC-3', action: 'moved to Completed', user: 'EMP-011', time: '2024-08-25T17:00:00' },
    ],
  }),
  task({
    id: 'TSK-5002', title: 'Floor Plan', type: 'Design Task', project: 'PRJ-2024-001', milestone: 'MS-801',
    assignedTo: 'EMP-002', assignedDepartment: 'Architecture', createdBy: 'EMP-004', reviewer: 'EMP-004',
    startDate: '2024-08-26', dueDate: '2024-09-10', estimatedHours: 24, actualHours: 14, priority: 'High', status: 'In Progress', approvalStatus: 'pending',
    tags: ['design'], createdDate: '2024-08-15',
    dependencies: [{ taskId: 'TSK-5001', type: 'FS' }],
    checklist: [
      { id: 'CL-4', text: 'Ground floor layout drafted', done: true },
      { id: 'CL-5', text: 'First floor layout drafted', done: false },
      { id: 'CL-6', text: 'Client requirements cross-checked', done: false },
    ],
    activity: [
      { id: 'AC-4', action: 'created the task', user: 'EMP-004', time: '2024-08-15T09:05:00' },
      { id: 'AC-5', action: 'moved to In Progress', user: 'EMP-002', time: '2024-08-26T09:00:00' },
    ],
  }),
  task({
    id: 'TSK-5003', title: '3D Design', type: 'Design Task', project: 'PRJ-2024-001', milestone: 'MS-801',
    assignedTo: 'EMP-010', assignedDepartment: 'Architecture', createdBy: 'EMP-004', reviewer: 'EMP-002',
    startDate: '2024-09-11', dueDate: '2024-09-24', estimatedHours: 20, actualHours: 0, priority: 'Medium', status: 'Not Started', approvalStatus: null,
    tags: ['design', '3d'], createdDate: '2024-08-15',
    dependencies: [{ taskId: 'TSK-5002', type: 'FS' }],
    activity: [{ id: 'AC-6', action: 'created the task', user: 'EMP-004', time: '2024-08-15T09:07:00' }],
  }),
  task({
    id: 'TSK-5004', title: 'Client Approval', type: 'Client Approval Task', project: 'PRJ-2024-001', milestone: 'MS-801',
    assignedTo: 'EMP-004', assignedDepartment: 'Architecture', createdBy: 'EMP-004', reviewer: 'EMP-001',
    startDate: '2024-09-25', dueDate: '2024-10-02', estimatedHours: 4, actualHours: 0, priority: 'High', status: 'Not Started', approvalStatus: null,
    tags: ['client'], createdDate: '2024-08-15',
    dependencies: [{ taskId: 'TSK-5003', type: 'FS' }],
    activity: [{ id: 'AC-7', action: 'created the task', user: 'EMP-004', time: '2024-08-15T09:08:00' }],
  }),

  // ---- Parent task / subtasks demo (Urban Nest Villa) ----
  task({
    id: 'TSK-5101', title: 'Complete Architectural Design', type: 'Design Task', project: 'PRJ-2024-003',
    assignedTo: 'EMP-008', assignedDepartment: 'Architecture', createdBy: 'EMP-004', reviewer: 'EMP-004',
    startDate: '2024-08-01', dueDate: '2024-09-30', estimatedHours: 80, actualHours: 38, priority: 'High', status: 'In Progress', approvalStatus: 'pending',
    tags: ['design', 'villa'], createdDate: '2024-07-28',
    description: 'Full architectural design package for the Urban Nest Villa cluster — from site analysis through client presentation.',
    activity: [{ id: 'AC-8', action: 'created the task', user: 'EMP-004', time: '2024-07-28T09:00:00' }],
  }),
  task({
    id: 'TSK-5102', title: 'Site analysis', type: 'Design Task', project: 'PRJ-2024-003', parentTask: 'TSK-5101',
    assignedTo: 'EMP-008', assignedDepartment: 'Architecture', createdBy: 'EMP-008', reviewer: null,
    startDate: '2024-08-01', dueDate: '2024-08-08', estimatedHours: 8, actualHours: 8, priority: 'Medium', status: 'Completed', approvalStatus: 'approved', createdDate: '2024-07-28',
  }),
  task({
    id: 'TSK-5103', title: 'Concept design', type: 'Design Task', project: 'PRJ-2024-003', parentTask: 'TSK-5101',
    assignedTo: 'EMP-008', assignedDepartment: 'Architecture', createdBy: 'EMP-008', reviewer: null,
    startDate: '2024-08-09', dueDate: '2024-08-20', estimatedHours: 16, actualHours: 15, priority: 'Medium', status: 'Completed', approvalStatus: 'approved', createdDate: '2024-07-28',
  }),
  task({
    id: 'TSK-5104', title: 'Floor plan', type: 'Design Task', project: 'PRJ-2024-003', parentTask: 'TSK-5101',
    assignedTo: 'EMP-020', assignedDepartment: 'Architecture', createdBy: 'EMP-008', reviewer: 'EMP-008',
    startDate: '2024-08-21', dueDate: '2024-09-10', estimatedHours: 24, actualHours: 15, priority: 'High', status: 'In Progress', approvalStatus: 'pending', createdDate: '2024-07-28',
  }),
  task({
    id: 'TSK-5105', title: 'Elevation', type: 'Drawing Task', project: 'PRJ-2024-003', parentTask: 'TSK-5101',
    assignedTo: 'EMP-020', assignedDepartment: 'Architecture', createdBy: 'EMP-008', reviewer: 'EMP-008',
    startDate: '2024-09-11', dueDate: '2024-09-30', estimatedHours: 20, actualHours: 0, priority: 'Medium', status: 'Not Started', approvalStatus: null, createdDate: '2024-07-28',
  }),

  // ---- Milestone progress demo: Concept Design milestone (Rhea Kapoor Penthouse) — 4/6 complete = 67% ----
  task({ id: 'TSK-5201', title: 'Client Requirement Collection', type: 'Client Approval Task', project: 'PRJ-2024-008', milestone: 'MS-809', assignedTo: 'EMP-009', assignedDepartment: 'Design', createdBy: 'EMP-003', reviewer: 'EMP-003', startDate: '2024-06-01', dueDate: '2024-06-05', estimatedHours: 4, actualHours: 4, priority: 'Medium', status: 'Completed', approvalStatus: 'approved', createdDate: '2024-05-28' }),
  task({ id: 'TSK-5202', title: 'Initial Concept', type: 'Design Task', project: 'PRJ-2024-008', milestone: 'MS-809', assignedTo: 'EMP-009', assignedDepartment: 'Design', createdBy: 'EMP-003', reviewer: 'EMP-003', startDate: '2024-06-06', dueDate: '2024-06-18', estimatedHours: 16, actualHours: 17, priority: 'High', status: 'Completed', approvalStatus: 'approved', createdDate: '2024-05-28' }),
  task({ id: 'TSK-5203', title: 'Floor Plan', type: 'Design Task', project: 'PRJ-2024-008', milestone: 'MS-809', assignedTo: 'EMP-009', assignedDepartment: 'Design', createdBy: 'EMP-003', reviewer: 'EMP-003', startDate: '2024-06-19', dueDate: '2024-07-02', estimatedHours: 16, actualHours: 16, priority: 'High', status: 'Completed', approvalStatus: 'approved', createdDate: '2024-05-28' }),
  task({ id: 'TSK-5204', title: '3D Concept', type: 'Design Task', project: 'PRJ-2024-008', milestone: 'MS-809', assignedTo: 'EMP-009', assignedDepartment: 'Design', createdBy: 'EMP-003', reviewer: 'EMP-003', startDate: '2024-07-03', dueDate: '2024-07-20', estimatedHours: 20, actualHours: 20, priority: 'Medium', status: 'Completed', approvalStatus: 'approved', createdDate: '2024-05-28' }),
  task({
    id: 'TSK-5205', title: 'Client Review', type: 'Client Approval Task', project: 'PRJ-2024-008', milestone: 'MS-809', assignedTo: 'EMP-003', assignedDepartment: 'Design', createdBy: 'EMP-003', reviewer: 'EMP-001',
    startDate: '2024-09-15', dueDate: '2024-09-25', estimatedHours: 4, actualHours: 2, priority: 'High', status: 'Review', approvalStatus: 'pending', createdDate: '2024-05-28',
    dependencies: [{ taskId: 'TSK-5204', type: 'FS' }],
    comments: [{ id: 'CM-2', author: 'EMP-003', text: 'Client walkthrough scheduled for Sep 24 — presenting the art-deco material palette.', time: '2024-09-18T14:00:00' }],
  }),
  task({ id: 'TSK-5206', title: 'Final Approval', type: 'Client Approval Task', project: 'PRJ-2024-008', milestone: 'MS-809', assignedTo: 'EMP-003', assignedDepartment: 'Design', createdBy: 'EMP-003', reviewer: 'EMP-001', startDate: '2024-09-26', dueDate: '2024-09-30', estimatedHours: 2, actualHours: 0, priority: 'Medium', status: 'Not Started', approvalStatus: null, createdDate: '2024-05-28', dependencies: [{ taskId: 'TSK-5205', type: 'FS' }] }),

  // ---- Varied task types across other projects, incl. overdue / critical / blocked / unassigned ----
  task({
    id: 'TSK-5301', title: 'Curtain wall mockup review', type: 'Inspection Task', project: 'PRJ-2024-002', milestone: 'MS-805',
    assignedTo: 'EMP-007', assignedDepartment: 'MEP', createdBy: 'EMP-005', reviewer: 'EMP-002',
    startDate: '2024-09-01', dueDate: '2024-09-15', estimatedHours: 12, actualHours: 6, priority: 'Critical', status: 'Blocked', approvalStatus: null,
    tags: ['facade', 'critical'], createdDate: '2024-08-25',
    comments: [{ id: 'CM-3', author: 'EMP-007', text: 'Blocked — waiting on the revised glazing spec from the vendor before the mockup can be re-inspected.', time: '2024-09-14T11:00:00' }],
    relatedPO: 'PO-2024-142',
  }),
  task({
    id: 'TSK-5302', title: 'BOQ revision for Lakeview Tower B', type: 'BOQ Task', project: 'PRJ-2024-004',
    assignedTo: 'EMP-004', assignedDepartment: 'Architecture', createdBy: 'EMP-001', reviewer: 'EMP-014',
    startDate: '2024-09-10', dueDate: '2024-09-19', estimatedHours: 10, actualHours: 9, priority: 'High', status: 'Review', approvalStatus: 'pending', createdDate: '2024-09-08',
  }),
  task({
    id: 'TSK-5303', title: 'Prepare structural drawing — transfer beams', type: 'Drawing Task', project: 'PRJ-2024-002',
    assignedTo: 'EMP-006', assignedDepartment: 'Structural', createdBy: 'EMP-005', reviewer: 'EMP-007',
    startDate: '2024-09-05', dueDate: '2024-09-20', estimatedHours: 18, actualHours: 12, priority: 'High', status: 'In Progress', approvalStatus: 'pending', createdDate: '2024-09-01',
    relatedDrawing: 'DRW-4003',
    attachments: [{ id: 'AT-1', name: 'Transfer-Beam-Layout-Rev02.pdf', type: 'PDF', size: '4.2 MB', uploadedBy: 'EMP-006', date: '2024-09-14' }],
  }),
  task({
    id: 'TSK-5304', title: 'Purchase flooring material', type: 'Procurement Task', project: 'PRJ-2024-001',
    assignedTo: 'EMP-013', assignedDepartment: 'Procurement', createdBy: 'EMP-004', reviewer: null,
    startDate: '2024-09-12', dueDate: '2024-09-26', estimatedHours: 6, actualHours: 3, priority: 'Medium', status: 'In Progress', approvalStatus: null, createdDate: '2024-09-10',
    relatedPO: 'PO-2024-141',
    activity: [
      { id: 'AC-9', action: 'created the task', user: 'EMP-004', time: '2024-09-10T10:00:00' },
      { id: 'AC-10', action: 'linked purchase order PO-2024-141', user: 'EMP-013', time: '2024-09-12T09:30:00' },
    ],
  }),
  task({
    id: 'TSK-5305', title: 'Complete Ground Floor Inspection', type: 'Inspection Task', project: 'PRJ-2024-004',
    assignedTo: 'EMP-021', assignedDepartment: 'Site Execution', createdBy: 'EMP-005', reviewer: 'EMP-006',
    startDate: '2024-09-14', dueDate: '2024-09-14', estimatedHours: 4, actualHours: 4, priority: 'High', status: 'Completed', approvalStatus: 'approved', createdDate: '2024-09-10',
  }),
  task({
    id: 'TSK-5306', title: 'Follow up pending client payment — ABC Constructions', type: 'Finance Task', project: 'PRJ-2024-002',
    assignedTo: 'EMP-014', assignedDepartment: 'Finance & Accounts', createdBy: 'EMP-001', reviewer: null,
    startDate: '2024-09-01', dueDate: '2024-09-10', estimatedHours: 2, actualHours: 1, priority: 'High', status: 'In Progress', approvalStatus: null, createdDate: '2024-08-28',
    relatedInvoice: 'INV-2024-0118', tags: ['collections'],
  }),
  task({
    id: 'TSK-5307', title: 'Q3 recruitment drive coordination', type: 'HR Task', project: null,
    assignedTo: 'EMP-016', assignedDepartment: 'Human Resources', createdBy: 'EMP-016', reviewer: null,
    startDate: '2024-09-01', dueDate: '2024-09-30', estimatedHours: 12, actualHours: 6, priority: 'Medium', status: 'In Progress', approvalStatus: null, createdDate: '2024-08-30',
  }),
  task({
    id: 'TSK-5308', title: 'Weekly design team sync — minutes & action items', type: 'Meeting Task', project: null,
    assignedTo: 'EMP-002', assignedDepartment: 'Architecture', createdBy: 'EMP-002', reviewer: null,
    startDate: '2024-09-16', dueDate: '2024-09-16', estimatedHours: 1, actualHours: 1, priority: 'Low', status: 'Completed', approvalStatus: null, createdDate: '2024-09-16',
  }),
  task({
    id: 'TSK-5309', title: 'Archive project handover documentation', type: 'Documentation Task', project: 'PRJ-2023-011',
    assignedTo: 'EMP-004', assignedDepartment: 'Architecture', createdBy: 'EMP-001', reviewer: null,
    startDate: '2024-01-05', dueDate: '2024-01-20', estimatedHours: 6, actualHours: 6, priority: 'Low', status: 'Completed', approvalStatus: 'approved', createdDate: '2024-01-02',
  }),
  task({
    id: 'TSK-5310', title: 'Estimate MEP cost for Greenfield Phase 1', type: 'Estimation Task', project: 'PRJ-2024-006',
    assignedTo: null, assignedDepartment: 'MEP', createdBy: 'EMP-005', reviewer: null,
    startDate: null, dueDate: '2024-10-05', estimatedHours: 14, actualHours: 0, priority: 'Medium', status: 'Not Started', approvalStatus: null, createdDate: '2024-09-15',
    tags: ['unassigned'],
  }),
  task({
    id: 'TSK-5311', title: 'General office IT support — printer setup', type: 'General Task', project: null,
    assignedTo: 'EMP-023', assignedDepartment: 'IT', createdBy: 'EMP-022', reviewer: null,
    startDate: '2024-09-17', dueDate: '2024-09-17', estimatedHours: 1, actualHours: 1, priority: 'Low', status: 'Completed', approvalStatus: null, createdDate: '2024-09-17',
  }),
  task({
    id: 'TSK-5312', title: 'Revise facade material palette per client feedback', type: 'Revision Task', project: 'PRJ-2024-005',
    assignedTo: 'EMP-009', assignedDepartment: 'Design', createdBy: 'EMP-003', reviewer: 'EMP-003',
    startDate: '2024-09-05', dueDate: '2024-09-12', estimatedHours: 8, actualHours: 8, priority: 'Critical', status: 'On Hold', approvalStatus: null, createdDate: '2024-09-03',
    comments: [{ id: 'CM-4', author: 'EMP-003', text: 'Put on hold — client wants to review the full interior palette together before we revise just the facade.', time: '2024-09-11T16:00:00' }],
  }),
  task({
    id: 'TSK-5313', title: 'Sign off Greenfield master plan v1.1', type: 'Client Approval Task', project: 'PRJ-2024-006',
    assignedTo: 'EMP-005', assignedDepartment: 'Architecture', createdBy: 'EMP-005', reviewer: 'EMP-001',
    startDate: '2024-09-18', dueDate: '2024-09-27', estimatedHours: 3, actualHours: 0, priority: 'Medium', status: 'Not Started', approvalStatus: null, createdDate: '2024-09-15',
  }),
]

export const activityFeed = [
  { id: 'ACT-1', user: 'EMP-011', action: 'uploaded a site photo batch', target: 'Green Valley Residence', time: '2024-09-19T08:20:00' },
  { id: 'ACT-2', user: 'EMP-002', action: 'approved drawing revision', target: 'LAX-GVR-A-101 Rev 02', time: '2024-09-19T07:10:00' },
  { id: 'ACT-3', user: 'EMP-013', action: 'raised a purchase request', target: 'PR-2024-075', time: '2024-09-18T16:45:00' },
  { id: 'ACT-4', user: 'EMP-017', action: 'moved opportunity to Negotiation', target: 'Coastal Hospitality Resort', time: '2024-09-18T15:30:00' },
  { id: 'ACT-5', user: 'EMP-014', action: 'marked invoice as paid', target: 'INV-2024-0112', time: '2024-09-18T12:05:00' },
  { id: 'ACT-6', user: 'EMP-007', action: 'commented on', target: 'LAX-SCT-M-501 HVAC layout', time: '2024-09-18T11:00:00' },
  { id: 'ACT-7', user: 'EMP-016', action: 'approved leave request for', target: 'Divya Ramanathan', time: '2024-09-17T18:15:00' },
]
