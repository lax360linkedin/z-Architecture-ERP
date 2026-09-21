export const taskStatuses = ['To Do', 'In Progress', 'In Review', 'Done']
export const taskPriorities = ['low', 'medium', 'high', 'urgent']

export const milestones = [
  { id: 'MS-801', project: 'PRJ-2024-001', name: 'Foundation Complete', dueDate: '2024-04-30', status: 'completed', progress: 100 },
  { id: 'MS-802', project: 'PRJ-2024-001', name: 'Structure Topping Out', dueDate: '2024-09-30', status: 'in-progress', progress: 85 },
  { id: 'MS-803', project: 'PRJ-2024-001', name: 'Interior Finishing Start', dueDate: '2024-12-15', status: 'pending', progress: 0 },
  { id: 'MS-804', project: 'PRJ-2024-002', name: 'Basement Excavation Complete', dueDate: '2024-02-28', status: 'completed', progress: 100 },
  { id: 'MS-805', project: 'PRJ-2024-002', name: 'Podium Structure Complete', dueDate: '2024-10-31', status: 'in-progress', progress: 55 },
  { id: 'MS-806', project: 'PRJ-2024-002', name: 'Facade Installation Start', dueDate: '2025-01-15', status: 'pending', progress: 0 },
  { id: 'MS-807', project: 'PRJ-2024-003', name: 'Design Approval', dueDate: '2024-08-15', status: 'delayed', progress: 90 },
  { id: 'MS-808', project: 'PRJ-2024-004', name: 'Tower A Foundation', dueDate: '2024-10-15', status: 'in-progress', progress: 40 },
]

export const wbsTasks = [
  { id: 'TSK-1001', project: 'PRJ-2024-001', name: 'Roof deck waterproofing', phase: 'Construction', assignee: 'EMP-011', priority: 'high', status: 'In Progress', startDate: '2024-09-10', dueDate: '2024-09-25', dependsOn: null },
  { id: 'TSK-1002', project: 'PRJ-2024-001', name: 'Pool plumbing rough-in', phase: 'Construction', assignee: 'EMP-011', priority: 'medium', status: 'To Do', startDate: '2024-09-26', dueDate: '2024-10-05', dependsOn: 'TSK-1001' },
  { id: 'TSK-1003', project: 'PRJ-2024-001', name: 'Facade stone sample approval', phase: 'Finishing', assignee: 'EMP-002', priority: 'high', status: 'In Review', startDate: '2024-09-05', dueDate: '2024-09-20', dependsOn: null },
  { id: 'TSK-1004', project: 'PRJ-2024-002', name: 'Level 8-10 slab pour', phase: 'Structure', assignee: 'EMP-012', priority: 'urgent', status: 'In Progress', startDate: '2024-09-08', dueDate: '2024-09-30', dependsOn: null },
  { id: 'TSK-1005', project: 'PRJ-2024-002', name: 'Curtain wall mockup review', phase: 'Facade', assignee: 'EMP-007', priority: 'high', status: 'To Do', startDate: '2024-10-01', dueDate: '2024-10-15', dependsOn: 'TSK-1004' },
  { id: 'TSK-1006', project: 'PRJ-2024-003', name: 'Clubhouse concept revision', phase: 'Design', assignee: 'EMP-008', priority: 'medium', status: 'Done', startDate: '2024-08-01', dueDate: '2024-08-20', dependsOn: null },
  { id: 'TSK-1007', project: 'PRJ-2024-005', name: 'Living room furniture procurement', phase: 'Execution', assignee: 'EMP-009', priority: 'medium', status: 'In Progress', startDate: '2024-09-01', dueDate: '2024-09-28', dependsOn: null },
  { id: 'TSK-1008', project: 'PRJ-2024-006', name: 'Topographic survey validation', phase: 'Planning', assignee: 'EMP-019', priority: 'high', status: 'In Progress', startDate: '2024-09-01', dueDate: '2024-09-22', dependsOn: null },
]

export const myTasks = [
  { id: 'TSK-2001', title: 'Review Skyline Tower facade mockup photos', project: 'PRJ-2024-002', priority: 'high', status: 'To Do', dueDate: '2024-09-22', assignee: 'EMP-002' },
  { id: 'TSK-2002', title: 'Approve GVR interior stone samples', project: 'PRJ-2024-001', priority: 'urgent', status: 'In Progress', dueDate: '2024-09-20', assignee: 'EMP-002' },
  { id: 'TSK-2003', title: 'Prepare BOQ revision for Lakeview Tower B', project: 'PRJ-2024-004', priority: 'medium', status: 'To Do', dueDate: '2024-09-25', assignee: 'EMP-002' },
  { id: 'TSK-2004', title: 'Client walkthrough - Malhotra Residence', project: 'PRJ-2024-005', priority: 'high', status: 'In Review', dueDate: '2024-09-21', assignee: 'EMP-003' },
  { id: 'TSK-2005', title: 'Sign off Greenfield master plan v1.1', project: 'PRJ-2024-006', priority: 'medium', status: 'To Do', dueDate: '2024-09-27', assignee: 'EMP-005' },
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
