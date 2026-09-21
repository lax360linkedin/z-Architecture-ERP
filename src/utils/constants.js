export const STATUS_COLORS = {
  // generic
  active: 'success',
  inactive: 'neutral',
  draft: 'neutral',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'danger',
  completed: 'success',
  'in-progress': 'info',
  'on-hold': 'warning',
  delayed: 'danger',
  open: 'info',
  closed: 'neutral',
  won: 'success',
  lost: 'danger',
  new: 'info',
  qualified: 'brand',
  paid: 'success',
  unpaid: 'danger',
  overdue: 'danger',
  'partially-paid': 'warning',
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger',
  resolved: 'success',
  'waiting': 'warning',
}

export const CURRENCY = '₹'

export const PROJECT_TYPES = [
  'Residential',
  'Commercial',
  'Interior Design',
  'Institutional',
  'Hospitality',
  'Renovation',
  'Landscape',
]

export const INDIAN_STATES = [
  'Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Telangana',
  'Gujarat', 'West Bengal', 'Rajasthan', 'Uttar Pradesh', 'Kerala',
]

// Professional job titles/designations an employee record can carry — NOT
// login/RBAC roles (those are the five in src/data/roles.js: Super Admin,
// Admin, HR, MD, Employee). An employee's designation and their login role
// are independent: an Architect can be assigned the "Employee" login role.
export const JOB_DESIGNATIONS = [
  'Managing Director',
  'Principal Architect',
  'Project Manager',
  'Architect',
  'Interior Designer',
  'Structural Engineer',
  'MEP Engineer',
  'Site Engineer',
  'Draftsman',
  'Procurement Manager',
  'Finance Manager',
  'HR Manager',
  'Sales Manager',
  'Admin Executive',
  'IT Administrator',
]

export const DEPARTMENTS = [
  'Design', 'Architecture', 'Structural', 'MEP', 'Site Execution',
  'Procurement', 'Finance & Accounts', 'Human Resources', 'Sales & CRM',
  'Business Development', 'Administration', 'IT',
]

export const MODULES = [
  'Dashboard', 'CRM', 'Sales', 'Projects', 'Design', 'Estimation',
  'Procurement', 'Inventory', 'Vendors', 'Finance', 'Billing', 'HR',
  'Site Management', 'Assets', 'Fleet', 'Helpdesk', 'Reports', 'Administration',
]
