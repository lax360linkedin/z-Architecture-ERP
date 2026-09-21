export const invoices = [
  { id: 'INV-2024-0112', client: 'CUST-002', project: 'PRJ-2024-002', date: '2024-08-01', dueDate: '2024-08-31', amount: 4750000, paid: 4750000, status: 'paid', items: [{ desc: 'Design Fee - Milestone 2', qty: 1, rate: 4750000 }] },
  { id: 'INV-2024-0118', client: 'CUST-002', project: 'PRJ-2024-002', date: '2024-09-01', dueDate: '2024-10-01', amount: 3200000, paid: 0, status: 'pending', items: [{ desc: 'Structural Consultancy - Milestone 1', qty: 1, rate: 3200000 }] },
  { id: 'INV-2024-0095', client: 'CUST-008', project: 'PRJ-2024-003', date: '2024-06-15', dueDate: '2024-07-15', amount: 1800000, paid: 1800000, status: 'paid', items: [{ desc: 'Concept & Schematic Design', qty: 1, rate: 1800000 }] },
  { id: 'INV-2024-0121', client: 'CUST-008', project: 'PRJ-2024-003', date: '2024-09-05', dueDate: '2024-09-20', amount: 1140000, paid: 0, status: 'overdue', items: [{ desc: 'Working Drawings - Batch 1', qty: 12, rate: 95000 }] },
  { id: 'INV-2024-0064', client: 'CUST-006', project: 'PRJ-2023-009', date: '2024-02-10', dueDate: '2024-03-10', amount: 12800000, paid: 12800000, status: 'paid', items: [{ desc: 'Heritage Renovation - Milestone 3', qty: 1, rate: 12800000 }] },
  { id: 'INV-2024-0130', client: 'CUST-006', project: 'PRJ-2023-009', date: '2024-09-12', dueDate: '2024-10-12', amount: 6400000, paid: 2000000, status: 'partially-paid', items: [{ desc: 'Heritage Renovation - Final Milestone', qty: 1, rate: 6400000 }] },
  { id: 'INV-2024-0080', client: 'CUST-007', project: 'PRJ-2024-005', date: '2024-05-01', dueDate: '2024-05-31', amount: 720000, paid: 720000, status: 'paid', items: [{ desc: 'Interior Design Fee - Advance', qty: 1, rate: 720000 }] },
  { id: 'INV-2024-0126', client: 'CUST-007', project: 'PRJ-2024-005', date: '2024-09-08', dueDate: '2024-09-28', amount: 720000, paid: 0, status: 'pending', items: [{ desc: 'Interior Design Fee - Milestone 2', qty: 1, rate: 720000 }] },
  { id: 'INV-2024-0038', client: 'CUST-009', project: 'PRJ-2023-011', date: '2023-11-20', dueDate: '2023-12-20', amount: 2130000, paid: 2130000, status: 'paid', items: [{ desc: 'Showroom Interior - Final Payment', qty: 1, rate: 2130000 }] },
  { id: 'INV-2024-0133', client: 'CUST-012', project: 'PRJ-2024-008', date: '2024-09-15', dueDate: '2024-10-05', amount: 425000, paid: 0, status: 'pending', items: [{ desc: 'Concept Design - Advance', qty: 1, rate: 425000 }] },
  { id: 'INV-2024-0100', client: 'CUST-001', project: 'PRJ-2024-001', date: '2024-07-05', dueDate: '2024-08-05', amount: 3850000, paid: 3850000, status: 'paid', items: [{ desc: 'Construction Milestone 3', qty: 1, rate: 3850000 }] },
  { id: 'INV-2024-0129', client: 'CUST-001', project: 'PRJ-2024-001', date: '2024-09-10', dueDate: '2024-09-30', amount: 4100000, paid: 0, status: 'overdue', items: [{ desc: 'Construction Milestone 4', qty: 1, rate: 4100000 }] },
]

export const getInvoiceById = (id) => invoices.find((i) => i.id === id)
