export const quotations = [
  {
    id: 'QUO-2024-041', client: 'CUST-002', project: 'PRJ-2024-002', title: 'Skyline Commercial Tower - Design & Consultancy',
    date: '2024-06-10', validity: '2024-07-10', status: 'approved', owner: 'EMP-002',
    items: [
      { service: 'Architectural Design Fee', qty: 1, unit: 'Lumpsum', rate: 9500000 },
      { service: 'Structural Consultancy', qty: 1, unit: 'Lumpsum', rate: 3200000 },
      { service: 'MEP Coordination', qty: 1, unit: 'Lumpsum', rate: 2100000 },
    ],
    discount: 2, tax: 18, terms: '50% advance, 30% on design approval, 20% on completion of drawings.',
  },
  {
    id: 'QUO-2024-052', client: 'CUST-008', project: 'PRJ-2024-003', title: 'Urban Nest Villa - Full Architectural Services',
    date: '2024-08-01', validity: '2024-09-01', status: 'sent', owner: 'EMP-004',
    items: [
      { service: 'Concept & Schematic Design', qty: 1, unit: 'Lumpsum', rate: 1800000 },
      { service: 'Working Drawings', qty: 12, unit: 'Units', rate: 95000 },
      { service: 'Site Supervision (12 months)', qty: 12, unit: 'Months', rate: 65000 },
    ],
    discount: 0, tax: 18, terms: 'Payment per milestone as per Schedule A.',
  },
  {
    id: 'QUO-2024-063', client: 'CUST-011', project: 'PRJ-2024-006', title: 'Greenfield Township - Master Planning',
    date: '2024-09-02', validity: '2024-10-02', status: 'draft', owner: 'EMP-005',
    items: [
      { service: 'Master Plan & Land Use Design', qty: 1, unit: 'Lumpsum', rate: 6500000 },
      { service: 'Landscape Concept Design', qty: 1, unit: 'Lumpsum', rate: 1450000 },
    ],
    discount: 5, tax: 18, terms: 'Advance of 40% against acceptance of quotation.',
  },
  {
    id: 'QUO-2024-035', client: 'CUST-007', project: 'PRJ-2024-005', title: 'Malhotra Residence - Interior Design',
    date: '2024-03-18', validity: '2024-04-18', status: 'approved', owner: 'EMP-003',
    items: [
      { service: 'Interior Design Fee (4BHK)', qty: 1, unit: 'Lumpsum', rate: 2400000 },
      { service: 'Custom Furniture Design', qty: 1, unit: 'Lumpsum', rate: 950000 },
      { service: 'Execution Supervision', qty: 8, unit: 'Months', rate: 45000 },
    ],
    discount: 0, tax: 18, terms: '30-30-30-10 milestone based payment.',
  },
  {
    id: 'QUO-2024-071', client: 'CUST-012', project: 'PRJ-2024-008', title: 'Kapoor Penthouse - Design Consultancy',
    date: '2024-09-10', validity: '2024-10-10', status: 'sent', owner: 'EMP-003',
    items: [
      { service: 'Concept Design (Art-Deco Theme)', qty: 1, unit: 'Lumpsum', rate: 850000 },
      { service: 'Detailed Design Development', qty: 1, unit: 'Lumpsum', rate: 1100000 },
    ],
    discount: 0, tax: 18, terms: '50% advance, balance on design freeze.',
  },
  {
    id: 'QUO-2024-028', client: 'CUST-009', project: 'PRJ-2023-011', title: 'Kabir Showroom - Interior Fit-out',
    date: '2023-02-14', validity: '2023-03-14', status: 'rejected', owner: 'EMP-004',
    items: [
      { service: 'Showroom Interior Design', qty: 1, unit: 'Lumpsum', rate: 1650000 },
      { service: 'Experience Zone Concept', qty: 1, unit: 'Lumpsum', rate: 480000 },
    ],
    discount: 8, tax: 18, terms: 'Client requested a revised scope; quotation superseded.',
  },
]

export const getQuotationById = (id) => quotations.find((q) => q.id === id)

export function quotationTotals(q) {
  const subtotal = q.items.reduce((sum, i) => sum + i.qty * i.rate, 0)
  const discountAmt = (subtotal * (q.discount || 0)) / 100
  const taxable = subtotal - discountAmt
  const taxAmt = (taxable * (q.tax || 0)) / 100
  const total = taxable + taxAmt
  return { subtotal, discountAmt, taxable, taxAmt, total }
}
