export const vendorCategories = ['Material Supplier', 'Contractor', 'Subcontractor', 'MEP Vendor', 'Furniture & Fixtures', 'Landscape', 'Equipment Rental']

export const vendors = [
  { id: 'VEN-301', name: 'Shreeji Steel & Cement Suppliers', category: 'Material Supplier', contact: '+91 98200 11122', email: 'sales@shreejisteel.in', city: 'Mumbai', gstin: '27AAECS1122P1Z3', rating: 4.6, status: 'active', since: '2018-05-10' },
  { id: 'VEN-302', name: 'BuildTech Contractors Pvt Ltd', category: 'Contractor', contact: '+91 98200 22233', email: 'contracts@buildtechindia.com', city: 'Mumbai', gstin: '27AAFCB2233Q1Z4', rating: 4.3, status: 'active', since: '2019-02-18' },
  { id: 'VEN-303', name: 'Precision Electricals & MEP', category: 'MEP Vendor', contact: '+91 98200 33344', email: 'info@precisionmep.in', city: 'Pune', gstin: '27AAGCP3344R1Z5', rating: 4.5, status: 'active', since: '2020-01-25' },
  { id: 'VEN-304', name: 'Craftwood Furniture Works', category: 'Furniture & Fixtures', contact: '+91 98200 44455', email: 'orders@craftwood.in', city: 'Bengaluru', gstin: '29AAHCC4455S1Z6', rating: 4.7, status: 'active', since: '2019-08-12' },
  { id: 'VEN-305', name: 'GreenScape Landscaping', category: 'Landscape', contact: '+91 98200 55566', email: 'projects@greenscape.in', city: 'Pune', gstin: '27AAICG5566T1Z7', rating: 4.2, status: 'active', since: '2021-03-09' },
  { id: 'VEN-306', name: 'Apex Structural Steel Fabricators', category: 'Subcontractor', contact: '+91 98200 66677', email: 'sales@apexsteel.in', city: 'Mumbai', gstin: '27AAJCA6677U1Z8', rating: 4.1, status: 'active', since: '2018-11-30' },
  { id: 'VEN-307', name: 'Reliable Glass & Facade Systems', category: 'Subcontractor', contact: '+91 98200 77788', email: 'info@reliableglass.in', city: 'Mumbai', gstin: '27AAKCR7788V1Z9', rating: 4.4, status: 'active', since: '2020-06-22' },
  { id: 'VEN-308', name: 'Heavy Lift Equipment Rentals', category: 'Equipment Rental', contact: '+91 98200 88899', email: 'bookings@heavyliftequip.in', city: 'Pune', gstin: '27AALCH8899W1Z1', rating: 3.9, status: 'active', since: '2022-04-14' },
  { id: 'VEN-309', name: 'Marble & Stone Emporium', category: 'Material Supplier', contact: '+91 98200 99900', email: 'sales@marblestone.in', city: 'Jaipur', gstin: '08AAMCM9900X1Z2', rating: 4.6, status: 'active', since: '2019-09-05' },
  { id: 'VEN-310', name: 'Coastal Plumbing & Sanitation', category: 'MEP Vendor', contact: '+91 98200 10011', email: 'service@coastalplumb.in', city: 'Chennai', gstin: '33AANCC1001Y1Z3', rating: 4.0, status: 'inactive', since: '2020-12-01' },
]

export const getVendorById = (id) => vendors.find((v) => v.id === id)
export const getVendorName = (id) => getVendorById(id)?.name || 'Unknown Vendor'
