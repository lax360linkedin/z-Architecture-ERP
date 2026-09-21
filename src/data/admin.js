export const company = {
  name: 'LAX360 Architecture ERP',
  legalName: 'LAX360 Design & Build Pvt. Ltd.',
  gstin: '27AABCL9988K1Z7',
  pan: 'AABCL9988K',
  address: '14th Floor, Meridian Business Bay, Bandra Kurla Complex, Mumbai 400051',
  phone: '+91 22 6890 1234',
  email: 'info@lax360.com',
  website: 'www.lax360.com',
}

export const branches = [
  { id: 'BR-01', name: 'Mumbai Head Office', city: 'Mumbai', manager: 'EMP-001', employees: 14, status: 'active' },
  { id: 'BR-02', name: 'Pune Regional Office', city: 'Pune', manager: 'EMP-005', employees: 6, status: 'active' },
  { id: 'BR-03', name: 'Bengaluru Studio', city: 'Bengaluru', manager: 'EMP-003', employees: 5, status: 'active' },
]

export const systemUsers = [
  { id: 'USR-001', name: 'Arjun Mehta', email: 'arjun.mehta@lax360.com', role: 'Director', status: 'active', lastLogin: '2024-09-19T08:30:00' },
  { id: 'USR-002', name: 'Priya Nair', email: 'priya.nair@lax360.com', role: 'Architect', status: 'active', lastLogin: '2024-09-19T09:02:00' },
  { id: 'USR-003', name: 'Ritika Chawla', email: 'ritika.chawla@lax360.com', role: 'Finance Manager', status: 'active', lastLogin: '2024-09-18T17:45:00' },
  { id: 'USR-004', name: 'Kavya Menon', email: 'kavya.menon@lax360.com', role: 'HR Manager', status: 'active', lastLogin: '2024-09-19T10:15:00' },
  { id: 'USR-005', name: 'Nikhil Bose', email: 'nikhil.bose@lax360.com', role: 'Sales Manager', status: 'active', lastLogin: '2024-09-18T14:20:00' },
  { id: 'USR-006', name: 'Farhan Sheikh', email: 'farhan.sheikh@lax360.com', role: 'Procurement Manager', status: 'active', lastLogin: '2024-09-19T07:55:00' },
  { id: 'USR-007', name: 'Rajesh Khanna', email: 'rajesh.khanna@gmail.com', role: 'Client', status: 'active', lastLogin: '2024-09-17T20:10:00' },
  { id: 'USR-008', name: 'Aditya Verma', email: 'aditya.verma@lax360.com', role: 'Site Engineer', status: 'inactive', lastLogin: '2024-08-30T11:00:00' },
]

export const permissionModules = ['Dashboard', 'CRM', 'Sales', 'Projects', 'Design & Drawings', 'Estimation & BOQ', 'Procurement', 'Inventory', 'Finance', 'Billing', 'HR', 'Site Management', 'Reports', 'Administration']

export const rolePermissions = {
  'Super Admin': permissionModules.reduce((acc, m) => ({ ...acc, [m]: { view: true, create: true, edit: true, delete: true, approve: true } }), {}),
  'Project Manager': permissionModules.reduce((acc, m) => ({ ...acc, [m]: { view: true, create: ['Projects', 'Design & Drawings', 'Site Management', 'Estimation & BOQ'].includes(m), edit: ['Projects', 'Design & Drawings', 'Site Management'].includes(m), delete: false, approve: ['Projects'].includes(m) } }), {}),
  'Finance Manager': permissionModules.reduce((acc, m) => ({ ...acc, [m]: { view: true, create: ['Finance', 'Billing'].includes(m), edit: ['Finance', 'Billing'].includes(m), delete: false, approve: ['Finance', 'Billing'].includes(m) } }), {}),
  'HR Manager': permissionModules.reduce((acc, m) => ({ ...acc, [m]: { view: ['Dashboard', 'HR', 'Reports'].includes(m), create: m === 'HR', edit: m === 'HR', delete: false, approve: m === 'HR' } }), {}),
  Employee: permissionModules.reduce((acc, m) => ({ ...acc, [m]: { view: ['Dashboard', 'Projects'].includes(m), create: false, edit: false, delete: false, approve: false } }), {}),
}

export const approvalWorkflows = [
  { id: 'WF-01', name: 'Purchase Order Approval', module: 'Procurement', steps: ['Procurement Manager', 'Finance Manager', 'Director'], threshold: '₹5,00,000+', status: 'active' },
  { id: 'WF-02', name: 'Quotation Approval', module: 'Sales', steps: ['Sales Manager', 'Director'], threshold: 'All quotations', status: 'active' },
  { id: 'WF-03', name: 'Expense Reimbursement', module: 'Finance', steps: ['Reporting Manager', 'Finance Manager'], threshold: '₹10,000+', status: 'active' },
  { id: 'WF-04', name: 'Leave Approval', module: 'HR', steps: ['Reporting Manager', 'HR Manager'], threshold: 'All requests', status: 'active' },
  { id: 'WF-05', name: 'Drawing Approval', module: 'Design & Drawings', steps: ['Design Lead', 'Project Manager'], threshold: 'All drawings', status: 'active' },
]

export const numberingSchemes = [
  { id: 'NUM-1', document: 'Quotation', format: 'QUO-{YYYY}-{####}', nextNumber: 'QUO-2024-072' },
  { id: 'NUM-2', document: 'Invoice', format: 'INV-{YYYY}-{####}', nextNumber: 'INV-2024-0134' },
  { id: 'NUM-3', document: 'Purchase Order', format: 'PO-{YYYY}-{###}', nextNumber: 'PO-2024-146' },
  { id: 'NUM-4', document: 'Project Code', format: 'LAX-{CODE}-{YY}', nextNumber: 'LAX-XXX-24' },
]

export const taxSettings = [
  { id: 'TAX-1', name: 'GST 18%', rate: 18, appliesTo: 'Professional Services', status: 'active' },
  { id: 'TAX-2', name: 'GST 12%', rate: 12, appliesTo: 'Works Contract', status: 'active' },
  { id: 'TAX-3', name: 'GST 5%', rate: 5, appliesTo: 'Affordable Housing', status: 'active' },
  { id: 'TAX-4', name: 'TDS 10%', rate: 10, appliesTo: 'Professional Fees (194J)', status: 'active' },
]

export const auditLogs = [
  { id: 'AUD-1', user: 'Ritika Chawla', action: 'Marked invoice as paid', module: 'Billing', record: 'INV-2024-0112', date: '2024-09-18T12:05:00', ip: '10.10.4.22', change: "status: pending → paid" },
  { id: 'AUD-2', user: 'Priya Nair', action: 'Approved drawing revision', module: 'Design & Drawings', record: 'LAX-GVR-A-101', date: '2024-09-19T07:10:00', ip: '10.10.4.11', change: "status: under-review → approved" },
  { id: 'AUD-3', user: 'Farhan Sheikh', action: 'Created purchase request', module: 'Procurement', record: 'PR-2024-075', date: '2024-09-17T16:00:00', ip: '10.10.4.31', change: 'new record' },
  { id: 'AUD-4', user: 'Kavya Menon', action: 'Approved leave request', module: 'HR', record: 'LV-801', date: '2024-09-14T18:15:00', ip: '10.10.4.19', change: "status: pending → approved" },
  { id: 'AUD-5', user: 'Nikhil Bose', action: 'Updated opportunity stage', module: 'CRM', record: 'OPP-202', date: '2024-09-18T15:30:00', ip: '10.10.4.27', change: 'stage: Proposal → Negotiation' },
]
