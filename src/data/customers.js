export const customers = [
  { id: 'CUST-001', name: 'Rajesh & Sunita Khanna', type: 'Individual', category: 'Homeowner', contact: '+91 98210 44556', email: 'rajesh.khanna@gmail.com', city: 'Mumbai', gstin: null, status: 'active', since: '2022-03-14' },
  { id: 'CUST-002', name: 'Meridian Developers Pvt. Ltd.', type: 'Corporate', category: 'Developer', contact: '+91 22 6612 3400', email: 'projects@meridiandevelopers.in', city: 'Mumbai', gstin: '27AACCM1234F1Z5', status: 'active', since: '2020-07-01' },
  { id: 'CUST-003', name: 'Lakeview Realty Group', type: 'Corporate', category: 'Property Firm', contact: '+91 20 4455 6677', email: 'contact@lakeviewrealty.in', city: 'Pune', gstin: '27AABCL5678G1Z2', status: 'active', since: '2021-01-22' },
  { id: 'CUST-004', name: 'Ananth & Deepa Subramaniam', type: 'Individual', category: 'Homeowner', contact: '+91 98450 33221', email: 'ananth.s@outlook.com', city: 'Bengaluru', gstin: null, status: 'active', since: '2023-02-09' },
  { id: 'CUST-005', name: 'Skyline Business Park LLP', type: 'Corporate', category: 'Corporate', contact: '+91 22 4433 9988', email: 'admin@skylinebp.in', city: 'Mumbai', gstin: '27AAFCS4433H1Z9', status: 'active', since: '2019-11-15' },
  { id: 'CUST-006', name: 'Heritage Hospitality Group', type: 'Corporate', category: 'Corporate', contact: '+91 79 2233 4455', email: 'projects@heritagehg.com', city: 'Ahmedabad', gstin: '24AAGCH2233K1Z1', status: 'active', since: '2021-06-30' },
  { id: 'CUST-007', name: 'Vivaan & Riya Malhotra', type: 'Individual', category: 'Homeowner', contact: '+91 98110 77889', email: 'vivaan.malhotra@gmail.com', city: 'Delhi', gstin: null, status: 'active', since: '2023-09-02' },
  { id: 'CUST-008', name: 'Urban Nest Properties', type: 'Corporate', category: 'Developer', contact: '+91 80 4567 8901', email: 'info@urbannest.in', city: 'Bengaluru', gstin: '29AAJCU6789L1Z4', status: 'active', since: '2022-05-18' },
  { id: 'CUST-009', name: 'Kabir Enterprises', type: 'Corporate', category: 'Corporate', contact: '+91 44 2288 9900', email: 'kabir.enterprises@yahoo.com', city: 'Chennai', gstin: '33AAKCK8899M1Z6', status: 'inactive', since: '2020-02-11' },
  { id: 'CUST-010', name: 'Dr. Alok & Mrs. Nandini Sen', type: 'Individual', category: 'Homeowner', contact: '+91 98300 66554', email: 'alok.sen@hotmail.com', city: 'Kolkata', gstin: null, status: 'active', since: '2023-11-27' },
  { id: 'CUST-011', name: 'Greenfield Township LLP', type: 'Corporate', category: 'Developer', contact: '+91 141 2678 990', email: 'sales@greenfieldtownship.in', city: 'Jaipur', gstin: '08AAGCG7899N1Z8', status: 'active', since: '2021-10-05' },
  { id: 'CUST-012', name: 'Rhea Kapoor', type: 'Individual', category: 'Homeowner', contact: '+91 98670 12345', email: 'rhea.kapoor@icloud.com', city: 'Pune', gstin: null, status: 'active', since: '2024-01-16' },
]

export const getCustomerById = (id) => customers.find((c) => c.id === id)
export const getCustomerName = (id) => getCustomerById(id)?.name || 'Unknown Client'
