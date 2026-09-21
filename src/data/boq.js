export const boqCategories = ['Civil Works', 'Structural Works', 'Finishing Works', 'MEP Works', 'Landscape Works', 'Furniture & Fixtures']

export const boqItems = [
  { id: 'BOQ-001', project: 'PRJ-2024-001', itemCode: 'CIV-101', description: 'Excavation for foundation - hard soil', category: 'Civil Works', unit: 'Cum', quantity: 850, rate: 320, tax: 18 },
  { id: 'BOQ-002', project: 'PRJ-2024-001', itemCode: 'STR-201', description: 'RCC M25 for footing & columns', category: 'Structural Works', unit: 'Cum', quantity: 420, rate: 8200, tax: 18 },
  { id: 'BOQ-003', project: 'PRJ-2024-001', itemCode: 'STR-202', description: 'TMT reinforcement steel Fe500', category: 'Structural Works', unit: 'Kg', quantity: 68000, rate: 68, tax: 18 },
  { id: 'BOQ-004', project: 'PRJ-2024-001', itemCode: 'FIN-301', description: 'Vitrified tile flooring 600x600', category: 'Finishing Works', unit: 'Sqm', quantity: 620, rate: 1450, tax: 18 },
  { id: 'BOQ-005', project: 'PRJ-2024-001', itemCode: 'MEP-401', description: 'Internal electrical wiring & fittings', category: 'MEP Works', unit: 'Sqft', quantity: 8200, rate: 185, tax: 18 },
  { id: 'BOQ-006', project: 'PRJ-2024-001', itemCode: 'LND-501', description: 'Landscape softscape & irrigation', category: 'Landscape Works', unit: 'Sqm', quantity: 1200, rate: 950, tax: 18 },
  { id: 'BOQ-007', project: 'PRJ-2024-002', itemCode: 'CIV-102', description: 'Excavation & shoring - basement 3 levels', category: 'Civil Works', unit: 'Cum', quantity: 12400, rate: 410, tax: 18 },
  { id: 'BOQ-008', project: 'PRJ-2024-002', itemCode: 'STR-203', description: 'RCC M40 for raft & core walls', category: 'Structural Works', unit: 'Cum', quantity: 8600, rate: 9400, tax: 18 },
  { id: 'BOQ-009', project: 'PRJ-2024-002', itemCode: 'MEP-402', description: 'Chiller plant & HVAC ducting', category: 'MEP Works', unit: 'Lumpsum', quantity: 1, rate: 28500000, tax: 18 },
  { id: 'BOQ-010', project: 'PRJ-2024-002', itemCode: 'FIN-302', description: 'Curtain wall glass facade', category: 'Finishing Works', unit: 'Sqm', quantity: 9800, rate: 6800, tax: 18 },
]

export const estimationSummary = {
  'PRJ-2024-001': { material: 18200000, labour: 6400000, subcontract: 5200000, overhead: 1850000, contingency: 1350000, marginPct: 12 },
  'PRJ-2024-002': { material: 142000000, labour: 48000000, subcontract: 96000000, overhead: 28000000, contingency: 18000000, marginPct: 15 },
  'PRJ-2024-003': { material: 6800000, labour: 2900000, subcontract: 3100000, overhead: 950000, contingency: 620000, marginPct: 10 },
  'PRJ-2024-004': { material: 58000000, labour: 24000000, subcontract: 32000000, overhead: 9800000, contingency: 6200000, marginPct: 13 },
}

export const budgetComparison = {
  'PRJ-2024-001': { estimated: 40500000, approved: 42000000, committed: 31200000, actual: 27650000 },
  'PRJ-2024-002': { estimated: 365000000, approved: 380000000, committed: 245000000, actual: 198500000 },
  'PRJ-2024-003': { estimated: 17800000, approved: 18500000, committed: 8600000, actual: 6420000 },
  'PRJ-2024-004': { estimated: 138000000, approved: 145000000, committed: 68000000, actual: 52300000 },
}

export function boqTotal(item) {
  const subtotal = item.quantity * item.rate
  return subtotal + (subtotal * item.tax) / 100
}
