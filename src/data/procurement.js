export const purchaseRequests = [
  { id: 'PR-2024-071', project: 'PRJ-2024-001', item: 'TMT Steel Bar 16mm', quantity: 25, unit: 'Ton', requestedBy: 'EMP-011', date: '2024-09-12', status: 'approved', priority: 'high' },
  { id: 'PR-2024-072', project: 'PRJ-2024-002', item: 'Toughened Glass 12mm', quantity: 2000, unit: 'Sqft', requestedBy: 'EMP-012', date: '2024-09-14', status: 'pending', priority: 'medium' },
  { id: 'PR-2024-073', project: 'PRJ-2024-004', item: 'PVC Pipe 4 inch', quantity: 200, unit: 'Piece', requestedBy: 'EMP-021', date: '2024-09-16', status: 'pending', priority: 'high' },
  { id: 'PR-2024-074', project: 'PRJ-2023-009', item: 'Marine Plywood 19mm', quantity: 40, unit: 'Sheet', requestedBy: 'EMP-009', date: '2024-09-05', status: 'converted', priority: 'low' },
  { id: 'PR-2024-075', project: 'PRJ-2024-006', item: 'Coarse Aggregate 20mm', quantity: 60, unit: 'Ton', requestedBy: 'EMP-021', date: '2024-09-17', status: 'rejected', priority: 'medium' },
]

export const rfqs = [
  { id: 'RFQ-2024-031', project: 'PRJ-2024-002', item: 'Toughened Glass 12mm - Facade Package', vendorsInvited: ['VEN-307', 'VEN-306', 'VEN-301'], dueDate: '2024-09-28', status: 'open', createdBy: 'EMP-013' },
  { id: 'RFQ-2024-032', project: 'PRJ-2024-001', item: 'TMT Steel Bar Supply', vendorsInvited: ['VEN-301', 'VEN-306'], dueDate: '2024-09-22', status: 'quotes-received', createdBy: 'EMP-013' },
  { id: 'RFQ-2024-033', project: 'PRJ-2024-004', item: 'Structural Steel Fabrication', vendorsInvited: ['VEN-306'], dueDate: '2024-09-25', status: 'open', createdBy: 'EMP-013' },
]

export const vendorQuotations = [
  { id: 'VQ-901', rfq: 'RFQ-2024-032', vendor: 'VEN-301', amount: 2612500, deliveryDays: 7, validity: '2024-10-05', status: 'received' },
  { id: 'VQ-902', rfq: 'RFQ-2024-032', vendor: 'VEN-306', amount: 2685000, deliveryDays: 5, validity: '2024-10-01', status: 'received' },
]

export const purchaseOrders = [
  { id: 'PO-2024-141', vendor: 'VEN-301', project: 'PRJ-2024-001', item: 'TMT Steel Bar 12mm', quantity: 25, unit: 'Ton', rate: 62500, date: '2024-09-01', deliveryDate: '2024-09-18', status: 'delivered' },
  { id: 'PO-2024-142', vendor: 'VEN-302', project: 'PRJ-2024-002', item: 'General Contracting - Phase 2', quantity: 1, unit: 'Lumpsum', rate: 45000000, date: '2024-08-15', deliveryDate: '2025-02-15', status: 'in-progress' },
  { id: 'PO-2024-143', vendor: 'VEN-304', project: 'PRJ-2024-005', item: 'Custom Furniture Set', quantity: 1, unit: 'Lumpsum', rate: 2100000, date: '2024-09-08', deliveryDate: '2024-10-20', status: 'in-progress' },
  { id: 'PO-2024-144', vendor: 'VEN-305', project: 'PRJ-2024-001', item: 'Landscape Package', quantity: 1, unit: 'Lumpsum', rate: 3200000, date: '2024-09-10', deliveryDate: '2024-11-30', status: 'approved' },
  { id: 'PO-2024-145', vendor: 'VEN-309', project: 'PRJ-2023-009', item: 'Marble Flooring - Lobby', quantity: 1800, unit: 'Sqft', rate: 850, date: '2024-07-20', deliveryDate: '2024-08-25', status: 'delivered' },
]

export const goodsReceipts = [
  { id: 'GRN-2024-081', po: 'PO-2024-141', receivedDate: '2024-09-18', receivedBy: 'EMP-011', quantity: 25, condition: 'good', status: 'completed' },
  { id: 'GRN-2024-082', po: 'PO-2024-145', receivedDate: '2024-08-25', receivedBy: 'EMP-005', quantity: 1800, condition: 'good', status: 'completed' },
]

export const purchaseInvoices = [
  { id: 'PINV-2024-061', po: 'PO-2024-141', vendor: 'VEN-301', amount: 1562500, date: '2024-09-19', dueDate: '2024-10-19', status: 'pending' },
  { id: 'PINV-2024-055', po: 'PO-2024-145', vendor: 'VEN-309', amount: 1530000, date: '2024-08-26', dueDate: '2024-09-25', status: 'paid' },
]
