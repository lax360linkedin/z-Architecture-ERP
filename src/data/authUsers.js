import { employees, getEmployeeById } from './employees'
import { getRoleById } from './roles'

// Demo accounts for the mock authentication layer. Password is the same for
// all demo accounts so reviewers can switch roles quickly. Each account maps
// 1:1 to an employee record (mirrors a real USR -> EMP foreign key) plus a
// roleId resolved against src/data/roles.js and a branch derived from the
// employee's office location — this is the "Admin -> Users -> Employee ->
// Role" chain described in the module-integration spec.
export const DEMO_PASSWORD = 'lax360demo'

const branchByLocation = { Mumbai: 'BR-01', Pune: 'BR-02', Bengaluru: 'BR-03' }

const rawAccounts = [
  { userId: 'USR-101', employeeId: 'EMP-023', roleId: 'super_admin', status: 'active' },
  { userId: 'USR-102', employeeId: 'EMP-022', roleId: 'admin', status: 'active' },
  { userId: 'USR-103', employeeId: 'EMP-001', roleId: 'director', status: 'active' },
  { userId: 'USR-104', employeeId: 'EMP-004', roleId: 'project_manager', status: 'active' },
  { userId: 'USR-105', employeeId: 'EMP-005', roleId: 'project_manager', status: 'active' },
  { userId: 'USR-106', employeeId: 'EMP-002', roleId: 'architect', status: 'active' },
  { userId: 'USR-107', employeeId: 'EMP-009', roleId: 'interior_designer', status: 'active' },
  { userId: 'USR-108', employeeId: 'EMP-006', roleId: 'engineer', status: 'active' },
  { userId: 'USR-109', employeeId: 'EMP-011', roleId: 'site_engineer', status: 'active' },
  { userId: 'USR-110', employeeId: 'EMP-010', roleId: 'draftsman', status: 'active' },
  { userId: 'USR-111', employeeId: 'EMP-014', roleId: 'finance_manager', status: 'active' },
  { userId: 'USR-112', employeeId: 'EMP-016', roleId: 'hr_manager', status: 'active' },
  { userId: 'USR-113', employeeId: 'EMP-013', roleId: 'procurement_manager', status: 'active' },
  { userId: 'USR-114', employeeId: 'EMP-017', roleId: 'sales_manager', status: 'active' },
  { userId: 'USR-115', employeeId: 'EMP-018', roleId: 'employee', status: 'active' },
  { userId: 'USR-116', employeeId: 'EMP-024', roleId: 'employee', status: 'inactive' },
]

function buildAuthUser(acc) {
  const emp = getEmployeeById(acc.employeeId)
  const role = getRoleById(acc.roleId)
  return {
    id: acc.userId,
    employeeId: acc.employeeId,
    name: emp.name,
    email: emp.email,
    designation: emp.designation,
    departmentId: emp.department,
    branchId: branchByLocation[emp.location] || 'BR-01',
    roleId: acc.roleId,
    role: role.label,
    permissions: role.permissions,
    dataScope: role.dataScope,
    status: acc.status,
    portal: 'internal',
    avatarColor: '#6a3aec',
  }
}

export const authUsers = rawAccounts.map(buildAuthUser)

// The single demo client account — kept separate since it maps to a
// customer record rather than an employee, and its portal is 'client'.
export const clientAuthUser = {
  id: 'USR-201',
  employeeId: null,
  customerId: 'CUST-001',
  name: 'Rajesh Khanna',
  email: 'rajesh.khanna@gmail.com',
  designation: 'Client',
  departmentId: null,
  branchId: null,
  roleId: 'client',
  role: 'Client',
  permissions: getRoleById('client').permissions,
  dataScope: getRoleById('client').dataScope,
  status: 'active',
  portal: 'client',
  avatarColor: '#7c5cf6',
}

export const allAuthUsers = [...authUsers, clientAuthUser]

export const getAuthUserByEmail = (email) => allAuthUsers.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
export const getAuthUserById = (id) => allAuthUsers.find((u) => u.id === id)
