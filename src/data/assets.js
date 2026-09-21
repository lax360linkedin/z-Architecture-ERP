export const assetCategories = ['IT Equipment', 'Site Equipment', 'Office Furniture', 'Survey Instruments', 'Software Licenses']

export const assets = [
  { id: 'AST-201', name: 'Dell Precision 5570 Workstation', category: 'IT Equipment', purchaseDate: '2023-04-10', cost: 185000, assignedTo: 'EMP-002', warrantyUntil: '2026-04-10', status: 'in-use' },
  { id: 'AST-202', name: 'Total Station Survey Instrument', category: 'Survey Instruments', purchaseDate: '2022-11-02', cost: 420000, assignedTo: 'EMP-011', warrantyUntil: '2025-11-02', status: 'in-use' },
  { id: 'AST-203', name: 'Tower Crane - 6 Ton (Leased)', category: 'Site Equipment', purchaseDate: '2024-01-15', cost: 2200000, assignedTo: 'EMP-012', warrantyUntil: '2025-01-15', status: 'in-use' },
  { id: 'AST-204', name: 'AutoCAD + Revit License Bundle (x12)', category: 'Software Licenses', purchaseDate: '2024-01-01', cost: 960000, assignedTo: 'EMP-023', warrantyUntil: '2025-01-01', status: 'in-use' },
  { id: 'AST-205', name: 'Site Office Container Unit', category: 'Office Furniture', purchaseDate: '2023-08-20', cost: 340000, assignedTo: 'EMP-005', warrantyUntil: '2028-08-20', status: 'in-use' },
  { id: 'AST-206', name: 'DJI Mavic 3 Enterprise Drone', category: 'Survey Instruments', purchaseDate: '2023-12-05', cost: 285000, assignedTo: 'EMP-021', warrantyUntil: '2024-12-05', status: 'maintenance' },
  { id: 'AST-207', name: 'HP LaserJet Enterprise Printer', category: 'IT Equipment', purchaseDate: '2022-06-18', cost: 78000, assignedTo: null, warrantyUntil: '2024-06-18', status: 'idle' },
  { id: 'AST-208', name: 'Concrete Vibrator Set (x4)', category: 'Site Equipment', purchaseDate: '2023-03-11', cost: 96000, assignedTo: 'EMP-011', warrantyUntil: '2025-03-11', status: 'in-use' },
]

export const assetAssignments = [
  { id: 'ASG-301', asset: 'AST-201', employee: 'EMP-002', assignedDate: '2023-04-12', returnDate: null, status: 'active' },
  { id: 'ASG-302', asset: 'AST-203', employee: 'EMP-012', assignedDate: '2024-01-16', returnDate: null, status: 'active' },
  { id: 'ASG-303', asset: 'AST-206', employee: 'EMP-021', assignedDate: '2023-12-06', returnDate: '2024-09-14', status: 'returned' },
]

export const assetMaintenance = [
  { id: 'MNT-401', asset: 'AST-206', type: 'Repair - Gimbal calibration', date: '2024-09-14', cost: 12500, status: 'in-progress' },
  { id: 'MNT-402', asset: 'AST-203', type: 'Scheduled Service', date: '2024-07-20', cost: 45000, status: 'completed' },
]
