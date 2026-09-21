export const designStages = ['Concept Design', 'Schematic Design', 'Design Development', 'Interior Design', 'Landscape', 'Structural Coordination', 'MEP Coordination', '3D Visualization']

export const designs = [
  { id: 'DSN-601', project: 'PRJ-2024-001', stage: 'Design Development', designer: 'EMP-002', version: 'v3.2', status: 'in-progress', updatedDate: '2024-09-12', notes: 'Refining roof deck layout and pool access.' },
  { id: 'DSN-602', project: 'PRJ-2024-001', stage: '3D Visualization', designer: 'EMP-010', version: 'v1.0', status: 'in-review', updatedDate: '2024-09-08', notes: 'Exterior renders for client walkthrough.' },
  { id: 'DSN-603', project: 'PRJ-2024-002', stage: 'Structural Coordination', designer: 'EMP-006', version: 'v4.1', status: 'in-progress', updatedDate: '2024-09-15', notes: 'Coordinating transfer beam clashes with MEP.' },
  { id: 'DSN-604', project: 'PRJ-2024-002', stage: 'MEP Coordination', designer: 'EMP-007', version: 'v2.0', status: 'in-progress', updatedDate: '2024-09-16', notes: 'Chiller plant room layout finalization.' },
  { id: 'DSN-605', project: 'PRJ-2024-003', stage: 'Schematic Design', designer: 'EMP-008', version: 'v2.3', status: 'approved', updatedDate: '2024-07-22', notes: 'Unit layouts approved by developer.' },
  { id: 'DSN-606', project: 'PRJ-2024-005', stage: 'Interior Design', designer: 'EMP-009', version: 'v3.0', status: 'in-progress', updatedDate: '2024-09-14', notes: 'Master bedroom and study finalized, living room pending.' },
  { id: 'DSN-607', project: 'PRJ-2024-006', stage: 'Concept Design', designer: 'EMP-019', version: 'v1.1', status: 'in-review', updatedDate: '2024-09-10', notes: 'Township zoning and open space distribution.' },
  { id: 'DSN-608', project: 'PRJ-2024-004', stage: 'Landscape', designer: 'EMP-019', version: 'v1.0', status: 'in-progress', updatedDate: '2024-09-05', notes: 'Amenity deck planting scheme.' },
  { id: 'DSN-609', project: 'PRJ-2024-008', stage: 'Concept Design', designer: 'EMP-009', version: 'v1.2', status: 'in-progress', updatedDate: '2024-09-13', notes: 'Art-deco material palette exploration.' },
]

export const documents = [
  { id: 'DOC-701', name: 'GVR - Structural Stability Certificate.pdf', project: 'PRJ-2024-001', folder: 'Approvals', type: 'PDF', size: '2.4 MB', uploadedBy: 'EMP-006', department: 'Structural', access: 'Internal', date: '2024-07-11', version: '1.0' },
  { id: 'DOC-702', name: 'GVR - Site Plan v2.dwg', project: 'PRJ-2024-001', folder: 'Drawings', type: 'DWG', size: '8.1 MB', uploadedBy: 'EMP-010', department: 'Architecture', access: 'Internal', date: '2024-08-20', version: '2.0' },
  { id: 'DOC-703', name: 'Skyline Tower - EIA Report.pdf', project: 'PRJ-2024-002', folder: 'Approvals', type: 'PDF', size: '14.6 MB', uploadedBy: 'EMP-005', department: 'Architecture', access: 'Restricted', date: '2024-03-02', version: '1.0' },
  { id: 'DOC-704', name: 'Skyline Tower - Cost Plan.xlsx', project: 'PRJ-2024-002', folder: 'Estimation', type: 'XLSX', size: '640 KB', uploadedBy: 'EMP-014', department: 'Finance & Accounts', access: 'Restricted', date: '2024-09-01', version: '3.1' },
  { id: 'DOC-705', name: 'Urban Nest - Client Agreement.docx', project: 'PRJ-2024-003', folder: 'Contracts', type: 'DOCX', size: '210 KB', uploadedBy: 'EMP-004', department: 'Architecture', access: 'Restricted', date: '2024-03-15', version: '1.0' },
  { id: 'DOC-706', name: 'Lakeview Apartments - Site Photos Sep.zip', project: 'PRJ-2024-004', folder: 'Site Photos', type: 'JPG', size: '46.2 MB', uploadedBy: 'EMP-021', department: 'Site Execution', access: 'Internal', date: '2024-09-16', version: '1.0' },
  { id: 'DOC-707', name: 'Heritage Renovation - Heritage NOC.pdf', project: 'PRJ-2023-009', folder: 'Approvals', type: 'PDF', size: '1.1 MB', uploadedBy: 'EMP-005', department: 'Architecture', access: 'Restricted', date: '2023-06-30', version: '1.0' },
  { id: 'DOC-708', name: 'Malhotra Residence - Furniture Catalogue.pdf', project: 'PRJ-2024-005', folder: 'Design', type: 'PDF', size: '9.8 MB', uploadedBy: 'EMP-009', department: 'Design', access: 'Internal', date: '2024-08-04', version: '1.2' },
  { id: 'DOC-709', name: 'Greenfield Township - Master Plan.dwg', project: 'PRJ-2024-006', folder: 'Drawings', type: 'DWG', size: '22.4 MB', uploadedBy: 'EMP-019', department: 'Design', access: 'Internal', date: '2024-09-10', version: '1.1' },
  { id: 'DOC-710', name: 'Company - GST Certificate.pdf', project: null, folder: 'Company', type: 'PDF', size: '540 KB', uploadedBy: 'EMP-022', department: 'Administration', access: 'Restricted', date: '2022-01-01', version: '1.0' },
]

export const documentFolders = ['Approvals', 'Drawings', 'Contracts', 'Estimation', 'Site Photos', 'Design', 'Company', 'HR', 'Finance']
