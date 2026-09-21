export const ticketStatuses = ['Open', 'In Progress', 'Waiting', 'Resolved', 'Closed']

export const tickets = [
  { id: 'TKT-9001', customer: 'CUST-001', project: 'PRJ-2024-001', subject: 'Request for updated construction timeline', priority: 'medium', assignedTo: 'EMP-004', status: 'In Progress', createdDate: '2024-09-15', messages: [
    { from: 'CUST-001', text: 'Could you share the revised timeline for the roof deck and pool works?', time: '2024-09-15T10:00:00' },
    { from: 'EMP-004', text: 'Sure, sharing the updated Gantt chart by tomorrow.', time: '2024-09-15T14:20:00' },
  ]},
  { id: 'TKT-9002', customer: 'CUST-008', project: 'PRJ-2024-003', subject: 'Clarification on villa unit boundary wall height', priority: 'low', assignedTo: 'EMP-008', status: 'Open', createdDate: '2024-09-17', messages: [
    { from: 'CUST-008', text: 'Please confirm the approved boundary wall height as per society norms.', time: '2024-09-17T09:15:00' },
  ]},
  { id: 'TKT-9003', customer: 'CUST-006', project: 'PRJ-2023-009', subject: 'Snag list for lobby area', priority: 'high', assignedTo: 'EMP-005', status: 'Waiting', createdDate: '2024-09-12', messages: [
    { from: 'CUST-006', text: 'A few marble tiles near the reception have chipped edges. Please advise on rectification.', time: '2024-09-12T11:30:00' },
    { from: 'EMP-005', text: 'Vendor has been notified, replacement scheduled this week.', time: '2024-09-13T09:00:00' },
  ]},
  { id: 'TKT-9004', customer: 'CUST-002', project: 'PRJ-2024-002', subject: 'Query on facade sample approval process', priority: 'medium', assignedTo: 'EMP-002', status: 'Resolved', createdDate: '2024-09-05', messages: [
    { from: 'CUST-002', text: 'What is the process to approve the curtain wall mockup?', time: '2024-09-05T13:00:00' },
    { from: 'EMP-002', text: 'We will schedule an on-site mockup review next week for sign-off.', time: '2024-09-06T10:45:00' },
    { from: 'CUST-002', text: 'Thanks, that works.', time: '2024-09-06T11:00:00' },
  ]},
  { id: 'TKT-9005', customer: 'CUST-007', project: 'PRJ-2024-005', subject: 'Furniture delivery delay concern', priority: 'high', assignedTo: 'EMP-009', status: 'Closed', createdDate: '2024-08-28', messages: [
    { from: 'CUST-007', text: 'The living room furniture was expected last week.', time: '2024-08-28T08:00:00' },
    { from: 'EMP-009', text: 'Apologies for the delay, vendor has confirmed delivery by Sep 28.', time: '2024-08-28T12:00:00' },
    { from: 'CUST-007', text: 'Noted, thank you.', time: '2024-08-29T09:00:00' },
  ]},
]

export const serviceRequests = [
  { id: 'SVC-1101', customer: 'CUST-002', type: 'Design Change Request', project: 'PRJ-2024-002', status: 'In Progress', raisedDate: '2024-09-10' },
  { id: 'SVC-1102', customer: 'CUST-001', type: 'Additional Site Visit', project: 'PRJ-2024-001', status: 'Open', raisedDate: '2024-09-16' },
]
