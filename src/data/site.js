export const siteReports = [
  {
    id: 'SR-5001', project: 'PRJ-2024-001', site: 'Green Valley Residence Site', engineer: 'EMP-011', date: '2024-09-18', weather: 'Clear',
    labourCount: 42, workCompleted: 'Roof deck waterproofing - 60% complete. Pool shell shuttering started.',
    materials: 'Received: 5 Ton TMT Steel, 200 bags cement', issues: 'Minor delay due to waterproofing membrane delivery.', photos: 4, remarks: 'On track for Sep 30 milestone.',
  },
  {
    id: 'SR-5002', project: 'PRJ-2024-002', site: 'Skyline Commercial Tower Site', engineer: 'EMP-012', date: '2024-09-18', weather: 'Overcast',
    labourCount: 128, workCompleted: 'Level 9 slab reinforcement in progress. Level 8 curing.',
    materials: 'Received: 40 Ton TMT Steel, RMC 220 Cum', issues: 'Crane availability constrained for 2 hours.', photos: 9, remarks: 'Slab pour scheduled for Sep 21.',
  },
  {
    id: 'SR-5003', project: 'PRJ-2024-004', site: 'Lakeview Apartments Site', engineer: 'EMP-021', date: '2024-09-19', weather: 'Rain',
    labourCount: 36, workCompleted: 'Tower A foundation excavation halted due to rain.',
    materials: 'No deliveries today.', issues: 'Waterlogging in excavation pit - pumping arranged.', photos: 3, remarks: 'Resume expected Sep 21 if weather clears.',
  },
  {
    id: 'SR-5004', project: 'PRJ-2023-009', site: 'Heritage Renovation Site', engineer: 'EMP-005', date: '2024-09-17', weather: 'Clear',
    labourCount: 18, workCompleted: 'Facade restoration finishing touches, lobby marble polishing.',
    materials: 'Received: Marble sealant, brass fittings', issues: 'None', photos: 6, remarks: 'On schedule for handover.',
  },
]

export const siteIssues = [
  { id: 'ISS-6001', project: 'PRJ-2024-002', title: 'Crane scheduling conflict between core and slab teams', severity: 'medium', raisedBy: 'EMP-012', date: '2024-09-18', status: 'open' },
  { id: 'ISS-6002', project: 'PRJ-2024-004', title: 'Waterlogging in Tower A excavation pit', severity: 'high', raisedBy: 'EMP-021', date: '2024-09-19', status: 'open' },
  { id: 'ISS-6003', project: 'PRJ-2024-001', title: 'Waterproofing membrane delivery delay', severity: 'low', raisedBy: 'EMP-011', date: '2024-09-15', status: 'resolved' },
  { id: 'ISS-6004', project: 'PRJ-2024-002', title: 'Rebar spacing deviation on Level 7', severity: 'high', raisedBy: 'EMP-006', date: '2024-09-12', status: 'resolved' },
]

export const inspections = [
  { id: 'INS-7001', project: 'PRJ-2024-001', type: 'Waterproofing Inspection', scheduledDate: '2024-09-22', inspector: 'EMP-006', status: 'scheduled' },
  { id: 'INS-7002', project: 'PRJ-2024-002', type: 'Structural Slab Inspection - L9', scheduledDate: '2024-09-21', inspector: 'EMP-006', status: 'scheduled' },
  { id: 'INS-7003', project: 'PRJ-2023-009', type: 'Final Handover Inspection', scheduledDate: '2024-09-25', inspector: 'EMP-005', status: 'scheduled' },
  { id: 'INS-7004', project: 'PRJ-2024-004', type: 'Foundation Rebar Inspection', scheduledDate: '2024-09-14', inspector: 'EMP-006', status: 'completed' },
]

export const siteVisits = [
  { id: 'VIS-8001', project: 'PRJ-2024-001', visitor: 'EMP-002', purpose: 'Design review with client', date: '2024-09-20', status: 'scheduled' },
  { id: 'VIS-8002', project: 'PRJ-2024-002', visitor: 'EMP-001', purpose: 'Monthly progress review', date: '2024-09-23', status: 'scheduled' },
  { id: 'VIS-8003', project: 'PRJ-2024-006', visitor: 'EMP-019', purpose: 'Topographic survey validation', date: '2024-09-19', status: 'completed' },
]
