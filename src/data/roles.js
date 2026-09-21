import { DATA_SCOPES } from '../utils/permissions'

// Every role a LAX360 account can hold. `permissions` is a list of
// "module.action" grants (wildcards allowed) consumed by can()/hasPermission()
// in PermissionContext. `dataScope` says how much of the record set within an
// allowed module the role sees (see DATA_SCOPES) — enforced by filtering
// helpers such as canAccessProject(), not by the permission check itself.
export const roles = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    level: 100,
    dataScope: DATA_SCOPES.GLOBAL,
    description: 'Full system access across every module, branch and record.',
    permissions: ['*'],
  },
  {
    id: 'admin',
    label: 'Admin',
    level: 90,
    dataScope: DATA_SCOPES.COMPANY,
    description: 'Business administration — everything except role/permission and system-security configuration.',
    permissions: [
      'dashboard.*', 'crm.*', 'sales.*', 'projects.*', 'design.*', 'estimation.*',
      'procurement.*', 'inventory.*', 'vendors.*', 'billing.*', 'finance.view',
      'hr.*', 'payroll.view', 'timesheets.*', 'site.*', 'tasks.*', 'meetings.*',
      'assets.*', 'fleet.*', 'helpdesk.*', 'reports.*', 'documents.*',
      'calendar.*', 'communication.*', 'administration.view', 'administration.auditLogs',
    ],
  },
  {
    id: 'director',
    label: 'Director',
    level: 85,
    dataScope: DATA_SCOPES.COMPANY,
    description: 'Executive visibility across the company with high-value approval rights.',
    permissions: [
      'dashboard.view', 'crm.view', 'sales.view', 'projects.view', 'projects.approve',
      'design.view', 'estimation.view', 'finance.view', 'finance.approve', 'billing.view',
      'hr.view', 'reports.view', 'reports.export', 'tasks.view', 'meetings.*',
      'calendar.view', 'communication.*', 'documents.view',
    ],
  },
  {
    id: 'project_manager',
    label: 'Project Manager',
    level: 60,
    dataScope: DATA_SCOPES.ASSIGNED,
    description: 'Full control of assigned projects — planning, design, site, tasks and budgets.',
    permissions: [
      'dashboard.view', 'projects.*', 'estimation.*', 'design.*', 'site.*',
      'tasks.*', 'timesheets.*', 'meetings.*', 'documents.*', 'calendar.*',
      'communication.*', 'reports.view',
    ],
  },
  {
    id: 'architect',
    label: 'Architect',
    level: 40,
    dataScope: DATA_SCOPES.ASSIGNED,
    description: 'Design ownership on assigned projects — drawings, revisions and client approvals.',
    permissions: [
      'dashboard.view', 'projects.view', 'design.*', 'documents.*',
      'tasks.view', 'tasks.edit', 'meetings.*', 'communication.*', 'calendar.view',
    ],
  },
  {
    id: 'interior_designer',
    label: 'Interior Designer',
    level: 40,
    dataScope: DATA_SCOPES.ASSIGNED,
    description: 'Interior design, drawings and client feedback on assigned projects.',
    permissions: [
      'dashboard.view', 'projects.view', 'design.*', 'documents.*',
      'tasks.view', 'tasks.edit', 'communication.*', 'calendar.view',
    ],
  },
  {
    id: 'engineer',
    label: 'Engineer',
    level: 40,
    dataScope: DATA_SCOPES.ASSIGNED,
    description: 'Engineering coordination — BOQ, drawings, site inspections on assigned projects.',
    permissions: [
      'dashboard.view', 'projects.view', 'design.view', 'estimation.view',
      'site.*', 'tasks.view', 'tasks.edit', 'documents.view',
    ],
  },
  {
    id: 'site_engineer',
    label: 'Site Engineer',
    level: 35,
    dataScope: DATA_SCOPES.ASSIGNED,
    description: 'Site execution — visits, daily reports, progress, issues and inspections.',
    permissions: [
      'dashboard.view', 'projects.view', 'site.*', 'tasks.view', 'tasks.edit', 'documents.view',
    ],
  },
  {
    id: 'draftsman',
    label: 'Draftsman',
    level: 30,
    dataScope: DATA_SCOPES.ASSIGNED,
    description: 'Drawing production and revisions on assigned projects.',
    permissions: [
      'dashboard.view', 'projects.view', 'design.view', 'design.upload', 'design.edit',
      'documents.*', 'tasks.view',
    ],
  },
  {
    id: 'finance_manager',
    label: 'Finance Manager',
    level: 65,
    dataScope: DATA_SCOPES.COMPANY,
    description: 'Company-wide finance, billing, receivables/payables and financial reporting.',
    permissions: [
      'dashboard.view', 'finance.*', 'billing.*', 'payroll.view', 'reports.view',
      'reports.export', 'projects.view',
    ],
  },
  {
    id: 'hr_manager',
    label: 'HR Manager',
    level: 65,
    dataScope: DATA_SCOPES.COMPANY,
    description: 'Employees, attendance, leave, payroll, recruitment and performance.',
    permissions: [
      'dashboard.view', 'hr.*', 'payroll.*', 'reports.view',
    ],
  },
  {
    id: 'procurement_manager',
    label: 'Procurement Manager',
    level: 55,
    dataScope: DATA_SCOPES.COMPANY,
    description: 'Vendors, purchase requests, RFQs, purchase orders and goods receipt.',
    permissions: [
      'dashboard.view', 'vendors.*', 'procurement.*', 'inventory.view', 'reports.view',
    ],
  },
  {
    id: 'sales_manager',
    label: 'Sales Manager',
    level: 55,
    dataScope: DATA_SCOPES.TEAM,
    description: 'CRM, leads, opportunities, quotations and sales analytics.',
    permissions: [
      'dashboard.view', 'crm.*', 'sales.*', 'reports.view',
    ],
  },
  {
    id: 'employee',
    label: 'Employee',
    level: 10,
    dataScope: DATA_SCOPES.OWN,
    description: 'Personal work area — own tasks, timesheets, meetings and documents.',
    permissions: [
      'dashboard.view', 'tasks.view', 'tasks.edit', 'timesheets.*', 'meetings.view',
      'communication.*', 'documents.view', 'calendar.view',
    ],
  },
  {
    id: 'client',
    label: 'Client',
    level: 5,
    dataScope: DATA_SCOPES.OWN,
    description: 'Client Portal only — own projects, drawings, documents, invoices and support.',
    permissions: ['clientPortal.*'],
  },
]

export const getRoleById = (id) => roles.find((r) => r.id === id)
export const getRolePermissions = (id) => getRoleById(id)?.permissions || []
