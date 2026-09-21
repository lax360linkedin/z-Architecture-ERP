import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PageLoader } from './components/layout/PageLoader'
import { Suspense } from 'react'

// Auth
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import SessionExpired from './pages/auth/SessionExpired'
import Unauthorized from './pages/system/Unauthorized'
import NotFound from './pages/system/NotFound'

// Dashboard
import Dashboard from './pages/dashboard/Dashboard'

function lazyPage(loader) {
  const Comp = lazy(loader)
  return (
    <Suspense fallback={<PageLoader />}>
      <Comp />
    </Suspense>
  )
}

// CRM
const Leads = () => lazyPage(() => import('./pages/crm/Leads'))
const Opportunities = () => lazyPage(() => import('./pages/crm/Opportunities'))
const Customers = () => lazyPage(() => import('./pages/crm/Customers'))
const CustomerDetail = () => lazyPage(() => import('./pages/crm/CustomerDetail'))
const FollowUps = () => lazyPage(() => import('./pages/crm/FollowUps'))

// Sales
const Quotations = () => lazyPage(() => import('./pages/sales/Quotations'))
const QuotationDetail = () => lazyPage(() => import('./pages/sales/QuotationDetail'))
const Proposals = () => lazyPage(() => import('./pages/sales/Proposals'))
const SalesOrders = () => lazyPage(() => import('./pages/sales/SalesOrders'))
const SalesAnalytics = () => lazyPage(() => import('./pages/sales/SalesAnalytics'))

// Projects
const ProjectList = () => lazyPage(() => import('./pages/projects/ProjectList'))
const ProjectDetail = () => lazyPage(() => import('./pages/projects/ProjectDetail'))
const ProjectPlanning = () => lazyPage(() => import('./pages/projects/ProjectPlanning'))
const ProjectMilestones = () => lazyPage(() => import('./pages/projects/ProjectMilestones'))
const ProjectTasks = () => lazyPage(() => import('./pages/projects/ProjectTasks'))
const ProjectBudget = () => lazyPage(() => import('./pages/projects/ProjectBudget'))
const ProjectAnalytics = () => lazyPage(() => import('./pages/projects/ProjectAnalytics'))

// Design & Drawings
const DesignManagement = () => lazyPage(() => import('./pages/design/DesignManagement'))
const DrawingRegister = () => lazyPage(() => import('./pages/design/DrawingRegister'))
const DrawingDetail = () => lazyPage(() => import('./pages/design/DrawingDetail'))
const Revisions = () => lazyPage(() => import('./pages/design/Revisions'))
const DesignApprovals = () => lazyPage(() => import('./pages/design/DesignApprovals'))
const DocumentManagement = () => lazyPage(() => import('./pages/design/DocumentManagement'))

// Estimation & BOQ
const BOQ = () => lazyPage(() => import('./pages/estimation/BOQ'))
const Estimation = () => lazyPage(() => import('./pages/estimation/Estimation'))
const CostPlanning = () => lazyPage(() => import('./pages/estimation/CostPlanning'))
const CostAnalysis = () => lazyPage(() => import('./pages/estimation/CostAnalysis'))

// Procurement
const PurchaseRequests = () => lazyPage(() => import('./pages/procurement/PurchaseRequests'))
const RFQ = () => lazyPage(() => import('./pages/procurement/RFQ'))
const VendorQuotations = () => lazyPage(() => import('./pages/procurement/VendorQuotations'))
const PurchaseOrders = () => lazyPage(() => import('./pages/procurement/PurchaseOrders'))
const GoodsReceipt = () => lazyPage(() => import('./pages/procurement/GoodsReceipt'))
const PurchaseInvoices = () => lazyPage(() => import('./pages/procurement/PurchaseInvoices'))

// Inventory
const Items = () => lazyPage(() => import('./pages/inventory/Items'))
const Stock = () => lazyPage(() => import('./pages/inventory/Stock'))
const Warehouses = () => lazyPage(() => import('./pages/inventory/Warehouses'))
const StockTransfer = () => lazyPage(() => import('./pages/inventory/StockTransfer'))
const InventoryReports = () => lazyPage(() => import('./pages/inventory/InventoryReports'))

// Vendors
const Vendors = () => lazyPage(() => import('./pages/vendors/Vendors'))
const VendorDetail = () => lazyPage(() => import('./pages/vendors/VendorDetail'))
const Contractors = () => lazyPage(() => import('./pages/vendors/Contractors'))
const Subcontractors = () => lazyPage(() => import('./pages/vendors/Subcontractors'))
const VendorPerformance = () => lazyPage(() => import('./pages/vendors/VendorPerformance'))

// Finance
const FinanceOverview = () => lazyPage(() => import('./pages/finance/FinanceOverview'))
const AccountsReceivable = () => lazyPage(() => import('./pages/finance/AccountsReceivable'))
const AccountsPayable = () => lazyPage(() => import('./pages/finance/AccountsPayable'))
const GeneralLedger = () => lazyPage(() => import('./pages/finance/GeneralLedger'))
const Expenses = () => lazyPage(() => import('./pages/finance/Expenses'))
const CashFlow = () => lazyPage(() => import('./pages/finance/CashFlow'))
const FinancialReports = () => lazyPage(() => import('./pages/finance/FinancialReports'))

// Billing
const Invoices = () => lazyPage(() => import('./pages/billing/Invoices'))
const InvoiceDetail = () => lazyPage(() => import('./pages/billing/InvoiceDetail'))
const Payments = () => lazyPage(() => import('./pages/billing/Payments'))
const CreditNotes = () => lazyPage(() => import('./pages/billing/CreditNotes'))
const DebitNotes = () => lazyPage(() => import('./pages/billing/DebitNotes'))
const PaymentTracking = () => lazyPage(() => import('./pages/billing/PaymentTracking'))

// HR
const Employees = () => lazyPage(() => import('./pages/hr/Employees'))
const EmployeeDetail = () => lazyPage(() => import('./pages/hr/EmployeeDetail'))
const Departments = () => lazyPage(() => import('./pages/hr/Departments'))
const Attendance = () => lazyPage(() => import('./pages/hr/Attendance'))
const Leave = () => lazyPage(() => import('./pages/hr/Leave'))
const Payroll = () => lazyPage(() => import('./pages/hr/Payroll'))
const Recruitment = () => lazyPage(() => import('./pages/hr/Recruitment'))
const Performance = () => lazyPage(() => import('./pages/hr/Performance'))
const EmployeeDocuments = () => lazyPage(() => import('./pages/hr/EmployeeDocuments'))

// Timesheets
const Timesheets = () => lazyPage(() => import('./pages/timesheets/Timesheets'))

// Site Management
const SiteOverview = () => lazyPage(() => import('./pages/site/SiteOverview'))
const SiteVisits = () => lazyPage(() => import('./pages/site/SiteVisits'))
const DailyReports = () => lazyPage(() => import('./pages/site/DailyReports'))
const SiteProgress = () => lazyPage(() => import('./pages/site/SiteProgress'))
const SiteIssues = () => lazyPage(() => import('./pages/site/SiteIssues'))
const Inspections = () => lazyPage(() => import('./pages/site/Inspections'))

// Tasks & Collaboration
const MyTasks = () => lazyPage(() => import('./pages/tasks/MyTasks'))
const TeamTasks = () => lazyPage(() => import('./pages/tasks/TeamTasks'))
const Kanban = () => lazyPage(() => import('./pages/tasks/Kanban'))
const Activity = () => lazyPage(() => import('./pages/tasks/Activity'))

// Meetings / Assets / Fleet / Helpdesk
const Meetings = () => lazyPage(() => import('./pages/meetings/Meetings'))
const Assets = () => lazyPage(() => import('./pages/assets/Assets'))
const AssetAssignments = () => lazyPage(() => import('./pages/assets/AssetAssignments'))
const AssetMaintenance = () => lazyPage(() => import('./pages/assets/AssetMaintenance'))
const Vehicles = () => lazyPage(() => import('./pages/fleet/Vehicles'))
const Drivers = () => lazyPage(() => import('./pages/fleet/Drivers'))
const Fuel = () => lazyPage(() => import('./pages/fleet/Fuel'))
const FleetMaintenance = () => lazyPage(() => import('./pages/fleet/FleetMaintenance'))
const Tickets = () => lazyPage(() => import('./pages/helpdesk/Tickets'))
const ServiceRequests = () => lazyPage(() => import('./pages/helpdesk/ServiceRequests'))
const CustomerIssues = () => lazyPage(() => import('./pages/helpdesk/CustomerIssues'))

// Reports / Client Portal / Calendar / Communication / Admin
const Reports = () => lazyPage(() => import('./pages/reports/Reports'))
const ClientPortal = () => lazyPage(() => import('./pages/clientPortal/ClientPortal'))
const CalendarPage = () => lazyPage(() => import('./pages/calendar/CalendarPage'))
const Communication = () => lazyPage(() => import('./pages/communication/Communication'))

const AdminCompany = () => lazyPage(() => import('./pages/administration/Company'))
const AdminBranches = () => lazyPage(() => import('./pages/administration/Branches'))
const AdminUsers = () => lazyPage(() => import('./pages/administration/AdminUsers'))
const AdminRoles = () => lazyPage(() => import('./pages/administration/Roles'))
const AdminWorkflows = () => lazyPage(() => import('./pages/administration/Workflows'))
const AdminTaxSettings = () => lazyPage(() => import('./pages/administration/TaxSettings'))
const AdminNumbering = () => lazyPage(() => import('./pages/administration/Numbering'))
const AdminAuditLogs = () => lazyPage(() => import('./pages/administration/AuditLogs'))
const AdminSystemSettings = () => lazyPage(() => import('./pages/administration/SystemSettings'))

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/session-expired" element={<SessionExpired />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/crm/leads" element={<Leads />} />
        <Route path="/crm/opportunities" element={<Opportunities />} />
        <Route path="/crm/customers" element={<Customers />} />
        <Route path="/crm/customers/:id" element={<CustomerDetail />} />
        <Route path="/crm/follow-ups" element={<FollowUps />} />

        <Route path="/sales/quotations" element={<Quotations />} />
        <Route path="/sales/quotations/:id" element={<QuotationDetail />} />
        <Route path="/sales/proposals" element={<Proposals />} />
        <Route path="/sales/sales-orders" element={<SalesOrders />} />
        <Route path="/sales/analytics" element={<SalesAnalytics />} />

        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/planning" element={<ProjectPlanning />} />
        <Route path="/projects/milestones" element={<ProjectMilestones />} />
        <Route path="/projects/tasks" element={<ProjectTasks />} />
        <Route path="/projects/budget" element={<ProjectBudget />} />
        <Route path="/projects/analytics" element={<ProjectAnalytics />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/:id/:tab" element={<ProjectDetail />} />

        <Route path="/design/management" element={<DesignManagement />} />
        <Route path="/design/drawings" element={<DrawingRegister />} />
        <Route path="/design/drawings/:id" element={<DrawingDetail />} />
        <Route path="/design/revisions" element={<Revisions />} />
        <Route path="/design/approvals" element={<DesignApprovals />} />
        <Route path="/design/documents" element={<DocumentManagement />} />

        <Route path="/estimation/boq" element={<BOQ />} />
        <Route path="/estimation/estimations" element={<Estimation />} />
        <Route path="/estimation/cost-planning" element={<CostPlanning />} />
        <Route path="/estimation/cost-analysis" element={<CostAnalysis />} />

        <Route path="/procurement/requests" element={<PurchaseRequests />} />
        <Route path="/procurement/rfq" element={<RFQ />} />
        <Route path="/procurement/vendor-quotations" element={<VendorQuotations />} />
        <Route path="/procurement/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/procurement/goods-receipt" element={<GoodsReceipt />} />
        <Route path="/procurement/purchase-invoices" element={<PurchaseInvoices />} />

        <Route path="/inventory/items" element={<Items />} />
        <Route path="/inventory/stock" element={<Stock />} />
        <Route path="/inventory/warehouses" element={<Warehouses />} />
        <Route path="/inventory/stock-transfer" element={<StockTransfer />} />
        <Route path="/inventory/reports" element={<InventoryReports />} />

        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />
        <Route path="/vendors/contractors" element={<Contractors />} />
        <Route path="/vendors/subcontractors" element={<Subcontractors />} />
        <Route path="/vendors/performance" element={<VendorPerformance />} />

        <Route path="/finance" element={<FinanceOverview />} />
        <Route path="/finance/receivables" element={<AccountsReceivable />} />
        <Route path="/finance/payables" element={<AccountsPayable />} />
        <Route path="/finance/ledger" element={<GeneralLedger />} />
        <Route path="/finance/expenses" element={<Expenses />} />
        <Route path="/finance/cash-flow" element={<CashFlow />} />
        <Route path="/finance/reports" element={<FinancialReports />} />

        <Route path="/billing/invoices" element={<Invoices />} />
        <Route path="/billing/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/billing/payments" element={<Payments />} />
        <Route path="/billing/credit-notes" element={<CreditNotes />} />
        <Route path="/billing/debit-notes" element={<DebitNotes />} />
        <Route path="/billing/tracking" element={<PaymentTracking />} />

        <Route path="/hr/employees" element={<Employees />} />
        <Route path="/hr/employees/:id" element={<EmployeeDetail />} />
        <Route path="/hr/departments" element={<Departments />} />
        <Route path="/hr/attendance" element={<Attendance />} />
        <Route path="/hr/leave" element={<Leave />} />
        <Route path="/hr/payroll" element={<Payroll />} />
        <Route path="/hr/recruitment" element={<Recruitment />} />
        <Route path="/hr/performance" element={<Performance />} />
        <Route path="/hr/documents" element={<EmployeeDocuments />} />

        <Route path="/timesheets" element={<Timesheets />} />

        <Route path="/site-management" element={<SiteOverview />} />
        <Route path="/site-management/visits" element={<SiteVisits />} />
        <Route path="/site-management/reports" element={<DailyReports />} />
        <Route path="/site-management/progress" element={<SiteProgress />} />
        <Route path="/site-management/issues" element={<SiteIssues />} />
        <Route path="/site-management/inspections" element={<Inspections />} />

        <Route path="/tasks/my-tasks" element={<MyTasks />} />
        <Route path="/tasks/team-tasks" element={<TeamTasks />} />
        <Route path="/tasks/kanban" element={<Kanban />} />
        <Route path="/tasks/activity" element={<Activity />} />

        <Route path="/meetings" element={<Meetings />} />

        <Route path="/assets" element={<Assets />} />
        <Route path="/assets/assignments" element={<AssetAssignments />} />
        <Route path="/assets/maintenance" element={<AssetMaintenance />} />

        <Route path="/fleet/vehicles" element={<Vehicles />} />
        <Route path="/fleet/drivers" element={<Drivers />} />
        <Route path="/fleet/fuel" element={<Fuel />} />
        <Route path="/fleet/maintenance" element={<FleetMaintenance />} />

        <Route path="/helpdesk/tickets" element={<Tickets />} />
        <Route path="/helpdesk/service-requests" element={<ServiceRequests />} />
        <Route path="/helpdesk/customer-issues" element={<CustomerIssues />} />

        <Route path="/reports" element={<Reports />} />
        <Route path="/client-portal" element={<ClientPortal />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/communication" element={<Communication />} />

        <Route path="/administration/company" element={<AdminCompany />} />
        <Route path="/administration/branches" element={<AdminBranches />} />
        <Route path="/administration/users" element={<AdminUsers />} />
        <Route path="/administration/roles" element={<AdminRoles />} />
        <Route path="/administration/workflows" element={<AdminWorkflows />} />
        <Route path="/administration/tax-settings" element={<AdminTaxSettings />} />
        <Route path="/administration/numbering" element={<AdminNumbering />} />
        <Route path="/administration/audit-logs" element={<AdminAuditLogs />} />
        <Route path="/administration/system-settings" element={<AdminSystemSettings />} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
