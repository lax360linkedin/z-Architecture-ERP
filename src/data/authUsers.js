import { employees, getEmployeeById } from './employees'
import { getRoleById } from './roles'

// Demo accounts for the mock authentication layer — LAX360 exposes exactly
// five login roles (Super Admin, Admin, HR, MD, Employee). Password is the
// same for all demo accounts so reviewers can switch roles quickly. Each
// account maps 1:1 to an employee record (mirrors a real USR -> EMP foreign
// key) plus a roleId resolved against src/data/roles.js and a branch derived
// from the employee's office location — this is the "Admin -> Users ->
// Employee -> Role" chain described in the module-integration spec.
export const DEMO_PASSWORD = 'lax360demo'

const branchByLocation = { Mumbai: 'BR-01', Pune: 'BR-02', Bengaluru: 'BR-03' }

const rawAccounts = [
  { userId: 'USR-101', employeeId: 'EMP-023', roleId: 'super_admin', status: 'active' },
  { userId: 'USR-102', employeeId: 'EMP-022', roleId: 'admin', status: 'active' },
  { userId: 'USR-103', employeeId: 'EMP-001', roleId: 'md', status: 'active' },
  { userId: 'USR-104', employeeId: 'EMP-016', roleId: 'hr', status: 'active' },
  { userId: 'USR-105', employeeId: 'EMP-018', roleId: 'employee', status: 'active' },
  { userId: 'USR-106', employeeId: 'EMP-024', roleId: 'employee', status: 'inactive' },
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
export const allAuthUsers = authUsers

export const getAuthUserByEmail = (email) => allAuthUsers.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
export const getAuthUserById = (id) => allAuthUsers.find((u) => u.id === id)
