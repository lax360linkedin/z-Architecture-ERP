export const drawingCategories = ['Floor Plan', 'Elevation', 'Section', 'Site Plan', 'Structural', 'Electrical', 'Plumbing', 'HVAC', 'Interior', 'Landscape']

export const drawings = [
  {
    id: 'DRW-4001', number: 'LAX-GVR-A-101', name: 'Ground Floor Plan', project: 'PRJ-2024-001', category: 'Floor Plan',
    revision: 'Rev 02', preparedBy: 'EMP-010', checkedBy: 'EMP-002', approvedBy: 'EMP-004', status: 'approved', updatedDate: '2024-08-20',
    revisions: [
      { rev: 'Rev 00', date: '2024-02-10', note: 'Initial Submission' },
      { rev: 'Rev 01', date: '2024-05-04', note: 'Client Revision - Kitchen layout changed' },
      { rev: 'Rev 02', date: '2024-08-20', note: 'Final Approved' },
    ],
  },
  {
    id: 'DRW-4002', number: 'LAX-GVR-A-201', name: 'Front & Side Elevation', project: 'PRJ-2024-001', category: 'Elevation',
    revision: 'Rev 01', preparedBy: 'EMP-010', checkedBy: 'EMP-002', approvedBy: 'EMP-004', status: 'approved', updatedDate: '2024-06-11',
    revisions: [
      { rev: 'Rev 00', date: '2024-02-15', note: 'Initial Submission' },
      { rev: 'Rev 01', date: '2024-06-11', note: 'Design Revision - Facade material updated' },
    ],
  },
  {
    id: 'DRW-4003', number: 'LAX-SCT-S-301', name: 'Foundation & Footing Layout', project: 'PRJ-2024-002', category: 'Structural',
    revision: 'Rev 03', preparedBy: 'EMP-006', checkedBy: 'EMP-007', approvedBy: 'EMP-005', status: 'under-review', updatedDate: '2024-09-14',
    revisions: [
      { rev: 'Rev 00', date: '2023-09-01', note: 'Initial Submission' },
      { rev: 'Rev 01', date: '2023-12-10', note: 'Client Revision - Core position shifted' },
      { rev: 'Rev 02', date: '2024-04-22', note: 'Design Revision - Load recalculation' },
      { rev: 'Rev 03', date: '2024-09-14', note: 'Structural review comments incorporated' },
    ],
  },
  {
    id: 'DRW-4004', number: 'LAX-SCT-E-401', name: 'Typical Floor Electrical Layout', project: 'PRJ-2024-002', category: 'Electrical',
    revision: 'Rev 00', preparedBy: 'EMP-007', checkedBy: 'EMP-007', approvedBy: null, status: 'draft', updatedDate: '2024-09-16',
    revisions: [{ rev: 'Rev 00', date: '2024-09-16', note: 'Initial Submission' }],
  },
  {
    id: 'DRW-4005', number: 'LAX-UNV-A-101', name: 'Typical Villa Unit Plan', project: 'PRJ-2024-003', category: 'Floor Plan',
    revision: 'Rev 01', preparedBy: 'EMP-020', checkedBy: 'EMP-008', approvedBy: 'EMP-004', status: 'approved', updatedDate: '2024-07-30',
    revisions: [
      { rev: 'Rev 00', date: '2024-04-05', note: 'Initial Submission' },
      { rev: 'Rev 01', date: '2024-07-30', note: 'Client Revision - Balcony extended' },
    ],
  },
  {
    id: 'DRW-4006', number: 'LAX-LVA-SP-001', name: 'Master Site Plan', project: 'PRJ-2024-004', category: 'Site Plan',
    revision: 'Rev 02', preparedBy: 'EMP-002', checkedBy: 'EMP-004', approvedBy: 'EMP-004', status: 'approved', updatedDate: '2024-05-19',
    revisions: [
      { rev: 'Rev 00', date: '2023-11-05', note: 'Initial Submission' },
      { rev: 'Rev 01', date: '2024-02-14', note: 'Design Revision - Tower positions adjusted' },
      { rev: 'Rev 02', date: '2024-05-19', note: 'Final Approved' },
    ],
  },
  {
    id: 'DRW-4007', number: 'LAX-HGR-I-501', name: 'Lobby Interior Detailing', project: 'PRJ-2023-009', category: 'Interior',
    revision: 'Rev 02', preparedBy: 'EMP-009', checkedBy: 'EMP-003', approvedBy: 'EMP-005', status: 'approved', updatedDate: '2024-08-02',
    revisions: [
      { rev: 'Rev 00', date: '2023-07-11', note: 'Initial Submission' },
      { rev: 'Rev 01', date: '2023-10-25', note: 'Client Revision - Reception counter redesign' },
      { rev: 'Rev 02', date: '2024-08-02', note: 'Final Approved for execution' },
    ],
  },
  {
    id: 'DRW-4008', number: 'LAX-GTP-L-001', name: 'Landscape Master Plan', project: 'PRJ-2024-006', category: 'Landscape',
    revision: 'Rev 00', preparedBy: 'EMP-019', checkedBy: 'EMP-002', approvedBy: null, status: 'under-review', updatedDate: '2024-09-10',
    revisions: [{ rev: 'Rev 00', date: '2024-09-10', note: 'Initial Submission' }],
  },
  {
    id: 'DRW-4009', number: 'LAX-VMR-I-201', name: 'Living & Dining Layout', project: 'PRJ-2024-005', category: 'Interior',
    revision: 'Rev 01', preparedBy: 'EMP-020', checkedBy: 'EMP-003', approvedBy: 'EMP-003', status: 'approved', updatedDate: '2024-06-28',
    revisions: [
      { rev: 'Rev 00', date: '2024-04-10', note: 'Initial Submission' },
      { rev: 'Rev 01', date: '2024-06-28', note: 'Client Revision - Dining unit resized' },
    ],
  },
  {
    id: 'DRW-4010', number: 'LAX-SCT-M-501', name: 'HVAC Duct Routing - Floor 5-10', project: 'PRJ-2024-002', category: 'HVAC',
    revision: 'Rev 00', preparedBy: 'EMP-007', checkedBy: null, approvedBy: null, status: 'draft', updatedDate: '2024-09-17',
    revisions: [{ rev: 'Rev 00', date: '2024-09-17', note: 'Initial Submission' }],
  },
]

export const getDrawingById = (id) => drawings.find((d) => d.id === id)
