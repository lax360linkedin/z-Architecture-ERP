export const warehouses = [
  { id: 'WH-01', name: 'Mumbai Central Yard', location: 'Bhandup, Mumbai', manager: 'EMP-013', type: 'Material Yard', status: 'active' },
  { id: 'WH-02', name: 'Pune Site Store', location: 'Baner, Pune', manager: 'EMP-012', type: 'Site Store', status: 'active' },
  { id: 'WH-03', name: 'Bengaluru Regional Store', location: 'Whitefield, Bengaluru', manager: 'EMP-008', type: 'Regional Store', status: 'active' },
]

export const itemCategories = ['Cement & Aggregates', 'Steel & Metal', 'Electrical', 'Plumbing', 'Tiles & Sanitary', 'Wood & Furniture', 'Paints & Finishes', 'Glass & Facade']

export const items = [
  { id: 'ITM-001', sku: 'CEM-OPC-53', name: 'OPC 53 Grade Cement', category: 'Cement & Aggregates', unit: 'Bag (50kg)', warehouse: 'WH-01', quantity: 1240, reorderLevel: 300, unitCost: 415, status: 'in-stock' },
  { id: 'ITM-002', sku: 'STL-TMT-12', name: 'TMT Steel Bar 12mm', category: 'Steel & Metal', unit: 'Ton', warehouse: 'WH-01', quantity: 42, reorderLevel: 20, unitCost: 62500, status: 'in-stock' },
  { id: 'ITM-003', sku: 'STL-TMT-16', name: 'TMT Steel Bar 16mm', category: 'Steel & Metal', unit: 'Ton', warehouse: 'WH-01', quantity: 8, reorderLevel: 15, unitCost: 62800, status: 'low-stock' },
  { id: 'ITM-004', sku: 'ELE-CBL-2.5', name: 'Copper Wire 2.5 sq.mm', category: 'Electrical', unit: 'Coil (90m)', warehouse: 'WH-02', quantity: 165, reorderLevel: 50, unitCost: 3450, status: 'in-stock' },
  { id: 'ITM-005', sku: 'PLM-PVC-4', name: 'PVC Pipe 4 inch', category: 'Plumbing', unit: 'Piece', warehouse: 'WH-02', quantity: 0, reorderLevel: 40, unitCost: 890, status: 'out-of-stock' },
  { id: 'ITM-006', sku: 'TIL-VIT-600', name: 'Vitrified Tile 600x600', category: 'Tiles & Sanitary', unit: 'Box (1.44 sqm)', warehouse: 'WH-03', quantity: 320, reorderLevel: 100, unitCost: 1250, status: 'in-stock' },
  { id: 'ITM-007', sku: 'WD-PLY-19', name: 'Marine Plywood 19mm', category: 'Wood & Furniture', unit: 'Sheet', warehouse: 'WH-03', quantity: 58, reorderLevel: 60, unitCost: 4200, status: 'low-stock' },
  { id: 'ITM-008', sku: 'PNT-EMS-20', name: 'Emulsion Paint (Premium)', category: 'Paints & Finishes', unit: 'Drum (20L)', warehouse: 'WH-01', quantity: 96, reorderLevel: 30, unitCost: 6800, status: 'in-stock' },
  { id: 'ITM-009', sku: 'GLS-TMP-12', name: 'Toughened Glass 12mm', category: 'Glass & Facade', unit: 'Sqft', warehouse: 'WH-01', quantity: 1850, reorderLevel: 500, unitCost: 340, status: 'in-stock' },
  { id: 'ITM-010', sku: 'CEM-AGG-20', name: 'Coarse Aggregate 20mm', category: 'Cement & Aggregates', unit: 'Ton', warehouse: 'WH-02', quantity: 12, reorderLevel: 25, unitCost: 1150, status: 'low-stock' },
  { id: 'ITM-011', sku: 'TIL-SAN-WC', name: 'Sanitaryware WC Set (Premium)', category: 'Tiles & Sanitary', unit: 'Set', warehouse: 'WH-03', quantity: 44, reorderLevel: 15, unitCost: 18500, status: 'in-stock' },
  { id: 'ITM-012', sku: 'ELE-MCB-32', name: 'MCB 32A Distribution Board', category: 'Electrical', unit: 'Unit', warehouse: 'WH-02', quantity: 3, reorderLevel: 10, unitCost: 2450, status: 'low-stock' },
]

export const stockTransfers = [
  { id: 'STX-501', item: 'ITM-002', from: 'WH-01', to: 'WH-02', quantity: 5, date: '2024-09-10', status: 'completed', requestedBy: 'EMP-012' },
  { id: 'STX-502', item: 'ITM-006', from: 'WH-03', to: 'WH-02', quantity: 40, date: '2024-09-15', status: 'in-transit', requestedBy: 'EMP-012' },
  { id: 'STX-503', item: 'ITM-009', from: 'WH-01', to: 'WH-03', quantity: 300, date: '2024-09-17', status: 'pending', requestedBy: 'EMP-008' },
]

export const getItemById = (id) => items.find((i) => i.id === id)
export const getWarehouseName = (id) => warehouses.find((w) => w.id === id)?.name || 'Unknown'
