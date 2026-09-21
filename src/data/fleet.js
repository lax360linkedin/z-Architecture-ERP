export const vehicles = [
  { id: 'VEH-101', regNo: 'MH-04-AB-2231', model: 'Mahindra Bolero Pickup', type: 'Material Transport', driver: 'Suresh Yadav', status: 'active', lastService: '2024-08-01', fuelType: 'Diesel' },
  { id: 'VEH-102', regNo: 'MH-12-CD-4456', model: 'Toyota Innova Crysta', type: 'Site Visit Vehicle', driver: 'Ramesh Pawar', status: 'active', lastService: '2024-07-15', fuelType: 'Diesel' },
  { id: 'VEH-103', regNo: 'MH-04-EF-7789', model: 'Tata Ace Gold', type: 'Material Transport', driver: 'Ganesh More', status: 'maintenance', lastService: '2024-09-10', fuelType: 'Diesel' },
  { id: 'VEH-104', regNo: 'KA-05-GH-1123', model: 'Mahindra Scorpio', type: 'Site Visit Vehicle', driver: 'Manjunath K.', status: 'active', lastService: '2024-06-28', fuelType: 'Diesel' },
  { id: 'VEH-105', regNo: 'MH-14-IJ-5567', model: 'Ashok Leyland Dost', type: 'Material Transport', driver: 'Vithal Jadhav', status: 'active', lastService: '2024-08-22', fuelType: 'Diesel' },
]

export const drivers = [
  { id: 'DRV-201', name: 'Suresh Yadav', license: 'MH04-2018-0012345', phone: '+91 98220 10101', vehicle: 'VEH-101', status: 'active' },
  { id: 'DRV-202', name: 'Ramesh Pawar', license: 'MH12-2016-0023456', phone: '+91 98220 20202', vehicle: 'VEH-102', status: 'active' },
  { id: 'DRV-203', name: 'Ganesh More', license: 'MH04-2019-0034567', phone: '+91 98220 30303', vehicle: 'VEH-103', status: 'active' },
  { id: 'DRV-204', name: 'Manjunath K.', license: 'KA05-2017-0045678', phone: '+91 98220 40404', vehicle: 'VEH-104', status: 'active' },
]

export const fuelLogs = [
  { id: 'FUEL-501', vehicle: 'VEH-101', date: '2024-09-15', litres: 45, cost: 4680, odometer: 45210 },
  { id: 'FUEL-502', vehicle: 'VEH-102', date: '2024-09-16', litres: 52, cost: 5408, odometer: 62340 },
  { id: 'FUEL-503', vehicle: 'VEH-105', date: '2024-09-17', litres: 38, cost: 3952, odometer: 28900 },
]

export const vehicleMaintenance = [
  { id: 'VMT-601', vehicle: 'VEH-103', type: 'Engine Overhaul', date: '2024-09-10', cost: 32000, status: 'in-progress' },
  { id: 'VMT-602', vehicle: 'VEH-101', type: 'Routine Service', date: '2024-08-01', cost: 6500, status: 'completed' },
]
