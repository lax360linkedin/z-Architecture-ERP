import {
  LayoutDashboard, Users, TrendingUp, FolderKanban, PenTool, Calculator,
  ShoppingCart, Boxes, Handshake, Landmark, Receipt, UsersRound, Clock,
  HardHat, ListChecks, Video, Package, Truck, LifeBuoy, BarChart3, Globe,
  Calendar, MessageSquare, Settings,
} from 'lucide-react'

// Each top-level entry carries a `module` used by Sidebar to filter the menu
// by permission (can(module, 'view')). A child may override it (e.g. HR's
// Payroll item is gated on the separate `payroll` module) for finer control.
export const navConfig = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', module: 'dashboard' },
  {
    label: 'CRM', icon: Users, module: 'crm', children: [
      { label: 'Leads', path: '/crm/leads' },
      { label: 'Opportunities', path: '/crm/opportunities' },
      { label: 'Customers', path: '/crm/customers' },
      { label: 'Follow-ups', path: '/crm/follow-ups' },
    ],
  },
  {
    label: 'Sales', icon: TrendingUp, module: 'sales', children: [
      { label: 'Quotations', path: '/sales/quotations' },
      { label: 'Proposals', path: '/sales/proposals' },
      { label: 'Sales Orders', path: '/sales/sales-orders' },
      { label: 'Sales Analytics', path: '/sales/analytics' },
    ],
  },
  {
    label: 'Projects', icon: FolderKanban, module: 'projects', children: [
      { label: 'All Projects', path: '/projects' },
      { label: 'Project Planning', path: '/projects/planning' },
      { label: 'Milestones', path: '/projects/milestones' },
      { label: 'Tasks', path: '/projects/tasks' },
      { label: 'Project Budget', path: '/projects/budget' },
      { label: 'Project Analytics', path: '/projects/analytics' },
    ],
  },
  // Task Management is a first-class ERP module — deliberately its own
  // top-level entry (not nested under Projects), positioned right after
  // Projects to mirror the core workflow (Project -> Milestone -> Task ->
  // Design/Drawing -> BOQ -> ...), and deeply cross-linked to Projects/
  // Milestones/Design/Procurement/Site/Timesheets/Finance.
  {
    label: 'Tasks', icon: ListChecks, module: 'tasks', children: [
      { label: 'Task Dashboard', path: '/tasks' },
      { label: 'All Tasks', path: '/tasks/list' },
      { label: 'My Tasks', path: '/tasks/my-tasks' },
      { label: 'Kanban Board', path: '/tasks/kanban' },
      { label: 'Task Calendar', path: '/tasks/calendar' },
      { label: 'Task Reports', path: '/tasks/reports' },
      { label: 'Activity', path: '/tasks/activity' },
    ],
  },
  {
    label: 'Design & Drawings', icon: PenTool, module: 'design', children: [
      { label: 'Design Management', path: '/design/management' },
      { label: 'Drawing Register', path: '/design/drawings' },
      { label: 'Revisions', path: '/design/revisions' },
      { label: 'Approvals', path: '/design/approvals' },
      { label: 'Document Management', path: '/design/documents' },
    ],
  },
  {
    label: 'Estimation & BOQ', icon: Calculator, module: 'estimation', children: [
      { label: 'BOQ', path: '/estimation/boq' },
      { label: 'Estimation', path: '/estimation/estimations' },
      { label: 'Cost Planning', path: '/estimation/cost-planning' },
      { label: 'Cost Analysis', path: '/estimation/cost-analysis' },
    ],
  },
  {
    label: 'Procurement', icon: ShoppingCart, module: 'procurement', children: [
      { label: 'Purchase Requests', path: '/procurement/requests' },
      { label: 'RFQ', path: '/procurement/rfq' },
      { label: 'Vendor Quotations', path: '/procurement/vendor-quotations' },
      { label: 'Purchase Orders', path: '/procurement/purchase-orders' },
      { label: 'Goods Receipt', path: '/procurement/goods-receipt' },
      { label: 'Purchase Invoices', path: '/procurement/purchase-invoices' },
    ],
  },
  {
    label: 'Inventory', icon: Boxes, module: 'inventory', children: [
      { label: 'Items', path: '/inventory/items' },
      { label: 'Stock', path: '/inventory/stock' },
      { label: 'Warehouses', path: '/inventory/warehouses' },
      { label: 'Stock Transfer', path: '/inventory/stock-transfer' },
      { label: 'Inventory Reports', path: '/inventory/reports' },
    ],
  },
  {
    label: 'Vendors', icon: Handshake, module: 'vendors', children: [
      { label: 'Vendors', path: '/vendors' },
      { label: 'Contractors', path: '/vendors/contractors' },
      { label: 'Subcontractors', path: '/vendors/subcontractors' },
      { label: 'Vendor Performance', path: '/vendors/performance' },
    ],
  },
  {
    label: 'Finance', icon: Landmark, module: 'finance', children: [
      { label: 'Overview', path: '/finance' },
      { label: 'Accounts Receivable', path: '/finance/receivables' },
      { label: 'Accounts Payable', path: '/finance/payables' },
      { label: 'General Ledger', path: '/finance/ledger' },
      { label: 'Expenses', path: '/finance/expenses' },
      { label: 'Cash Flow', path: '/finance/cash-flow' },
      { label: 'Financial Reports', path: '/finance/reports' },
    ],
  },
  {
    label: 'Billing', icon: Receipt, module: 'billing', children: [
      { label: 'Invoices', path: '/billing/invoices' },
      { label: 'Payments', path: '/billing/payments' },
      { label: 'Credit Notes', path: '/billing/credit-notes' },
      { label: 'Debit Notes', path: '/billing/debit-notes' },
      { label: 'Payment Tracking', path: '/billing/tracking' },
    ],
  },
  {
    // No `module` on the group itself — visibility is derived from whether
    // any child is visible (see Sidebar.useVisibleNav), since Employee only
    // has `hr.viewSelf` (Attendance/Leave/Documents) while Admin/HR have the
    // full `hr.*` module (every child, including the employee directory).
    label: 'HR', icon: UsersRound, children: [
      { label: 'Employees', path: '/hr/employees', module: 'hr', action: 'view' },
      { label: 'Departments', path: '/hr/departments', module: 'hr', action: 'view' },
      { label: 'Attendance', path: '/hr/attendance', module: 'hr', action: 'viewSelf' },
      { label: 'Leave', path: '/hr/leave', module: 'hr', action: 'viewSelf' },
      { label: 'Payroll', path: '/hr/payroll', module: 'payroll' },
      { label: 'Recruitment', path: '/hr/recruitment', module: 'hr', action: 'view' },
      { label: 'Performance', path: '/hr/performance', module: 'hr', action: 'view' },
      { label: 'Employee Documents', path: '/hr/documents', module: 'hr', action: 'viewSelf' },
    ],
  },
  { label: 'Timesheets', icon: Clock, path: '/timesheets', module: 'timesheets' },
  {
    label: 'Site Management', icon: HardHat, module: 'site', children: [
      { label: 'Site Overview', path: '/site-management' },
      { label: 'Site Visits', path: '/site-management/visits' },
      { label: 'Daily Reports', path: '/site-management/reports' },
      { label: 'Progress', path: '/site-management/progress' },
      { label: 'Issues', path: '/site-management/issues' },
      { label: 'Inspections', path: '/site-management/inspections' },
    ],
  },
  { label: 'Meetings', icon: Video, path: '/meetings', module: 'meetings' },
  {
    label: 'Assets', icon: Package, module: 'assets', children: [
      { label: 'Assets', path: '/assets' },
      { label: 'Assignments', path: '/assets/assignments' },
      { label: 'Maintenance', path: '/assets/maintenance' },
    ],
  },
  {
    label: 'Fleet', icon: Truck, module: 'fleet', children: [
      { label: 'Vehicles', path: '/fleet/vehicles' },
      { label: 'Drivers', path: '/fleet/drivers' },
      { label: 'Fuel', path: '/fleet/fuel' },
      { label: 'Maintenance', path: '/fleet/maintenance' },
    ],
  },
  {
    label: 'Helpdesk', icon: LifeBuoy, module: 'helpdesk', children: [
      { label: 'Tickets', path: '/helpdesk/tickets' },
      { label: 'Service Requests', path: '/helpdesk/service-requests' },
      { label: 'Customer Issues', path: '/helpdesk/customer-issues' },
    ],
  },
  { label: 'Reports & Analytics', icon: BarChart3, path: '/reports', module: 'reports' },
  { label: 'Calendar', icon: Calendar, path: '/calendar', module: 'calendar' },
  { label: 'Communication', icon: MessageSquare, path: '/communication', module: 'communication' },
  {
    label: 'Administration', icon: Settings, module: 'administration', children: [
      { label: 'Company', path: '/administration/company' },
      { label: 'Branches', path: '/administration/branches' },
      { label: 'Users', path: '/administration/users' },
      { label: 'Roles & Permissions', path: '/administration/roles' },
      { label: 'Approval Workflows', path: '/administration/workflows' },
      { label: 'Task Types', path: '/administration/task-types' },
      { label: 'Tax Settings', path: '/administration/tax-settings' },
      { label: 'Numbering', path: '/administration/numbering' },
      { label: 'Audit Logs', path: '/administration/audit-logs' },
      { label: 'System Settings', path: '/administration/system-settings' },
    ],
  },
]

export const flatNavItems = navConfig.flatMap((item) => (item.children ? item.children : [item]))
