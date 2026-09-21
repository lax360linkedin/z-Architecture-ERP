// Centralized permission vocabulary. Every permission string has the shape
// "module.action" (e.g. "projects.edit"). Wildcards are supported at either
// segment: "projects.*" grants every action on projects, "*" grants everything.
// This file has no framework dependencies so it can be unit tested or reused
// by a future backend without change.

export const MODULES = [
  'dashboard', 'crm', 'sales', 'projects', 'design', 'estimation',
  'procurement', 'inventory', 'vendors', 'finance', 'billing', 'hr',
  'payroll', 'timesheets', 'site', 'tasks', 'meetings', 'assets', 'fleet',
  'helpdesk', 'reports', 'clientPortal', 'calendar', 'communication',
  'administration', 'documents',
]

export const ACTIONS = ['view', 'create', 'edit', 'delete', 'approve', 'export', 'assign', 'upload', 'download']

export const DATA_SCOPES = {
  GLOBAL: 'global', // Super Admin — every branch, every record
  COMPANY: 'company', // company-wide within accessible modules
  BRANCH: 'branch', // limited to the user's branch
  DEPARTMENT: 'department',
  TEAM: 'team', // records owned by the user's reporting team
  ASSIGNED: 'assigned', // only records the user is explicitly assigned to
  OWN: 'own', // only records the user personally owns/created
}

// Matches a granted permission pattern against a requested "module.action".
// Supports "*", "module.*" and exact "module.action" grants.
export function matchPermission(granted, requestedModule, requestedAction) {
  if (granted === '*') return true
  const [gModule, gAction] = granted.split('.')
  if (gModule !== requestedModule && gModule !== '*') return false
  if (gAction === '*' || gAction === undefined) return true
  return gAction === requestedAction
}

export function can(permissions = [], module, action = 'view') {
  if (!permissions) return false
  return permissions.some((p) => matchPermission(p, module, action))
}

// Route → required permission map. A route not listed here is accessible to
// any authenticated (internal) user; routes listed require the given
// "module.action" permission or the user is redirected to /unauthorized.
export const ROUTE_PERMISSIONS = {
  '/administration/company': 'administration.view',
  '/administration/branches': 'administration.view',
  '/administration/users': 'administration.view',
  '/administration/roles': 'administration.roles',
  '/administration/workflows': 'administration.view',
  '/administration/task-types': 'administration.view',
  '/administration/tax-settings': 'administration.view',
  '/administration/numbering': 'administration.view',
  '/administration/audit-logs': 'administration.auditLogs',
  '/administration/system-settings': 'administration.systemSettings',
  '/hr/payroll': 'payroll.view',
  '/finance': 'finance.view',
  '/finance/receivables': 'finance.view',
  '/finance/payables': 'finance.view',
  '/finance/ledger': 'finance.view',
  '/finance/expenses': 'finance.view',
  '/finance/cash-flow': 'finance.view',
  '/finance/reports': 'finance.view',
  '/hr/employees': 'hr.view',
  '/hr/departments': 'hr.view',
  '/hr/recruitment': 'hr.view',
  '/hr/performance': 'hr.view',
  // Attendance, Leave and Employee Documents accept either the full `hr.view`
  // grant (Admin/HR see everyone) or the narrower `hr.viewSelf` grant
  // (Employee sees only their own records, enforced inside each page).
  '/hr/attendance': 'hr.viewSelf',
  '/hr/leave': 'hr.viewSelf',
  '/hr/documents': 'hr.viewSelf',
}

// Project-level access: who may open a given project, independent of the
// blanket "projects.view" module permission. Super Admin, Admin and MD see
// every project; everyone else (Employee) must be the assigned manager or a
// team member.
export const GLOBAL_PROJECT_ROLES = ['super_admin', 'admin', 'md']

export function canAccessProject(user, project) {
  if (!user || !project) return false
  if (GLOBAL_PROJECT_ROLES.includes(user.roleId)) return true
  if (project.manager === user.employeeId) return true
  if ((project.team || []).includes(user.employeeId)) return true
  return false
}

// Task-level access: who may open/act on a given task, independent of the
// blanket "tasks.view" module permission. Super Admin, Admin and MD see
// every task (company/project-level visibility); Employee only sees tasks
// they're assigned to, created, or are reviewing — "only records and
// actions assigned to that employee" per the RBAC spec.
export const GLOBAL_TASK_ROLES = ['super_admin', 'admin', 'md']

export function canAccessTask(user, taskRecord) {
  if (!user || !taskRecord) return false
  if (GLOBAL_TASK_ROLES.includes(user.roleId)) return true
  if (taskRecord.assignedTo === user.employeeId) return true
  if (taskRecord.createdBy === user.employeeId) return true
  if (taskRecord.reviewer === user.employeeId) return true
  return false
}

export function permissionForRoute(pathname) {
  if (ROUTE_PERMISSIONS[pathname]) return ROUTE_PERMISSIONS[pathname]
  // Prefix match for detail/nested routes, e.g. /administration/users/:id
  const match = Object.keys(ROUTE_PERMISSIONS).find((route) => pathname.startsWith(route + '/'))
  return match ? ROUTE_PERMISSIONS[match] : null
}
