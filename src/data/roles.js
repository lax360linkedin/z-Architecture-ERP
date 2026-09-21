import { DATA_SCOPES } from '../utils/permissions'

// LAX360 ships with exactly five login roles. Each role's `permissions` is a
// list of "module.action" grants (wildcards allowed) consumed by can()/
// hasPermission() in PermissionContext — never check `user.roleId` directly
// in a component; always go through can()/isRole() so access stays defined
// in one place. `dataScope` says how much of an allowed module's records the
// role sees (see DATA_SCOPES), enforced by scoping helpers like
// canAccessProject() and the "viewSelf" HR actions below, not by the
// permission check itself.
//
// Two HR actions are distinguished on purpose: `hr.view` is the full HR
// module (employee directory, departments, recruitment, performance —
// company-wide), while `hr.viewSelf` is just enough to reach Attendance,
// Leave and Employee Documents scoped to the signed-in employee's own
// records. `hr.*` (granted to admin/hr) implies both; Employee is granted
// only `hr.viewSelf`.
export const roles = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    level: 100,
    dataScope: DATA_SCOPES.GLOBAL,
    description: 'Full ERP access — every module, user management, role & permission management, system and company settings, audit logs, all dashboards and reports.',
    permissions: ['*'],
  },
  {
    id: 'admin',
    label: 'Admin',
    level: 80,
    dataScope: DATA_SCOPES.COMPANY,
    description: 'Operational access to permitted modules — CRM, customers, projects, sales, procurement, inventory, tasks, reports and employee/user operations — without role/permission management or system-level security settings.',
    permissions: [
      'dashboard.*', 'crm.*', 'sales.*', 'projects.*', 'design.*', 'estimation.*',
      'procurement.*', 'inventory.*', 'vendors.*', 'billing.*', 'finance.view',
      'hr.*', 'payroll.view', 'timesheets.*', 'site.*', 'tasks.*', 'meetings.*',
      'assets.*', 'fleet.*', 'helpdesk.*', 'reports.*', 'documents.*',
      'calendar.*', 'communication.*', 'administration.view', 'administration.auditLogs',
    ],
  },
  {
    id: 'hr',
    label: 'HR',
    level: 60,
    dataScope: DATA_SCOPES.COMPANY,
    description: 'HR dashboard, employees, attendance, leave, payroll, recruitment, performance, employee documents and HR reports — no finance, system administration or unrelated modules.',
    permissions: [
      'dashboard.view', 'hr.*', 'payroll.*', 'reports.view', 'communication.*', 'calendar.view',
    ],
  },
  {
    id: 'md',
    label: 'MD',
    level: 90,
    dataScope: DATA_SCOPES.COMPANY,
    description: 'Executive/company dashboard — CRM and customers, sales, projects, finance overview, revenue, expenses, profitability, business reports, approvals and company-level insights.',
    permissions: [
      'dashboard.view', 'crm.view', 'sales.view', 'projects.view', 'projects.approve',
      'design.view', 'estimation.view', 'finance.view', 'finance.approve', 'billing.view',
      'hr.view', 'reports.view', 'reports.export', 'tasks.view', 'tasks.approve', 'tasks.export',
      'meetings.*', 'calendar.view', 'communication.*', 'documents.view',
    ],
  },
  {
    id: 'employee',
    label: 'Employee',
    level: 10,
    dataScope: DATA_SCOPES.OWN,
    description: 'Personal dashboard — my profile, my tasks, my assigned projects, my attendance, my leave, my timesheets, my documents and communication. Only records and actions assigned to this employee.',
    permissions: [
      // Deliberately NOT a `tasks.*` wildcard: an Employee can view, update
      // progress/status, comment, and upload attachments on tasks they can
      // already reach (canAccessTask), and mark their own work complete —
      // but cannot create, delete, assign/reassign others' tasks, approve,
      // or manage dependencies. See utils/permissions.canAccessTask for the
      // record-level (assigned/created/reviewing) scoping.
      'dashboard.view', 'projects.view', 'tasks.view', 'tasks.edit', 'tasks.comment',
      'tasks.upload', 'tasks.complete', 'timesheets.*', 'hr.viewSelf',
      'meetings.view', 'communication.*', 'documents.view', 'calendar.view',
    ],
  },
]

export const getRoleById = (id) => roles.find((r) => r.id === id)
export const getRolePermissions = (id) => getRoleById(id)?.permissions || []
