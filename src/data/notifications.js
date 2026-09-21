export const notifications = [
  { id: 'NOT-1', category: 'Approvals', title: 'Purchase Order PO-2024-144 awaiting your approval', time: '2024-09-19T08:00:00', read: false, priority: 'high', link: '/procurement/purchase-orders' },
  { id: 'NOT-2', category: 'Tasks', title: 'Task "Review Skyline Tower facade mockup photos" is due tomorrow', time: '2024-09-19T07:30:00', read: false, priority: 'medium', link: '/tasks/my-tasks' },
  { id: 'NOT-3', category: 'Finance', title: 'Invoice INV-2024-0129 is now overdue', time: '2024-09-18T18:00:00', read: false, priority: 'high', link: '/billing/invoices' },
  { id: 'NOT-4', category: 'Projects', title: 'Milestone "Structure Topping Out" is 85% complete', time: '2024-09-18T16:00:00', read: true, priority: 'low', link: '/projects/PRJ-2024-001' },
  { id: 'NOT-5', category: 'HR', title: 'Pooja Trivedi requested Earned Leave (Oct 2 - Oct 8)', time: '2024-09-18T11:00:00', read: false, priority: 'medium', link: '/hr/leave' },
  { id: 'NOT-6', category: 'System', title: 'Monthly backup completed successfully', time: '2024-09-18T02:00:00', read: true, priority: 'low', link: '/administration/system-settings' },
  { id: 'NOT-7', category: 'Projects', title: 'New drawing revision uploaded for LAX-SCT-S-301', time: '2024-09-14T13:00:00', read: true, priority: 'medium', link: '/design/drawings' },
]

export const chatChannels = [
  { id: 'CH-1', type: 'project', name: 'Green Valley Residence', members: ['EMP-002', 'EMP-004', 'EMP-011', 'EMP-010'], unread: 3 },
  { id: 'CH-2', type: 'project', name: 'Skyline Commercial Tower', members: ['EMP-001', 'EMP-005', 'EMP-002', 'EMP-007'], unread: 0 },
  { id: 'CH-3', type: 'group', name: 'Design Team', members: ['EMP-002', 'EMP-003', 'EMP-008', 'EMP-019', 'EMP-009'], unread: 12 },
  { id: 'CH-4', type: 'direct', name: 'Ritika Chawla', members: ['EMP-014'], unread: 1 },
]

export const chatMessages = {
  'CH-1': [
    { from: 'EMP-011', text: 'Roof deck waterproofing is 60% done, should finish by Friday.', time: '2024-09-19T08:20:00' },
    { from: 'EMP-002', text: 'Great, please share photos once complete.', time: '2024-09-19T08:25:00' },
    { from: 'EMP-004', text: 'Client walkthrough confirmed for Sep 20, 11 AM.', time: '2024-09-19T09:00:00' },
  ],
  'CH-4': [
    { from: 'EMP-014', text: 'Can you approve the PO for the landscape package?', time: '2024-09-19T09:40:00' },
  ],
}
