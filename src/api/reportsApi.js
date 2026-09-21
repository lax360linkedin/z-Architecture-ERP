import { mockGet } from './mockClient'
import { opportunities } from '../data/opportunities'
import { leads } from '../data/leads'
import { projects } from '../data/projects'
import { invoices } from '../data/invoices'
import { purchaseOrders } from '../data/procurement'
import { vendors } from '../data/vendors'
import { items } from '../data/inventory'
import { attendanceRecords, leaveRequests, payrollRuns } from '../data/hr'
import { employees } from '../data/employees'

export const reportCategories = [
  {
    id: 'sales', label: 'Sales', reports: [
      { id: 'lead-conversion', label: 'Lead Conversion' },
      { id: 'sales-pipeline', label: 'Sales Pipeline' },
      { id: 'revenue', label: 'Revenue' },
    ],
  },
  {
    id: 'projects', label: 'Projects', reports: [
      { id: 'project-performance', label: 'Project Performance' },
      { id: 'project-profitability', label: 'Project Profitability' },
      { id: 'delayed-projects', label: 'Delayed Projects' },
      { id: 'budget-variance', label: 'Budget Variance' },
    ],
  },
  {
    id: 'finance', label: 'Finance', reports: [
      { id: 'pnl', label: 'P&L' },
      { id: 'cash-flow', label: 'Cash Flow' },
      { id: 'receivables', label: 'Receivables' },
      { id: 'payables', label: 'Payables' },
    ],
  },
  {
    id: 'hr', label: 'HR', reports: [
      { id: 'attendance', label: 'Attendance' },
      { id: 'leave', label: 'Leave' },
      { id: 'payroll', label: 'Payroll' },
      { id: 'utilization', label: 'Employee Utilization' },
    ],
  },
  {
    id: 'procurement', label: 'Procurement', reports: [
      { id: 'purchase', label: 'Purchase' },
      { id: 'vendor-performance', label: 'Vendor Performance' },
      { id: 'spend-analysis', label: 'Spend Analysis' },
    ],
  },
  {
    id: 'inventory', label: 'Inventory', reports: [
      { id: 'stock', label: 'Stock' },
      { id: 'inventory-value', label: 'Inventory Value' },
      { id: 'stock-movement', label: 'Stock Movement' },
    ],
  },
]

export const reportsApi = {
  async run(reportId) {
    switch (reportId) {
      case 'lead-conversion': {
        const total = leads.length
        const converted = leads.filter((l) => l.status === 'converted').length
        return mockGet({ columns: ['Status', 'Count'], rows: ['new', 'contacted', 'qualified', 'unqualified', 'converted'].map((s) => [s, leads.filter((l) => l.status === s).length]), summary: `${converted}/${total} leads converted (${Math.round((converted / total) * 100)}%)` })
      }
      case 'sales-pipeline':
        return mockGet({ columns: ['Stage', 'Deals', 'Value'], rows: [...new Set(opportunities.map((o) => o.stage))].map((s) => [s, opportunities.filter((o) => o.stage === s).length, opportunities.filter((o) => o.stage === s).reduce((sum, o) => sum + o.value, 0)]) })
      case 'revenue':
        return mockGet({ columns: ['Client', 'Invoiced', 'Collected'], rows: invoices.map((i) => [i.client, i.amount, i.paid]) })
      case 'project-performance':
        return mockGet({ columns: ['Project', 'Budget', 'Actual', 'Progress'], rows: projects.map((p) => [p.name, p.budget, p.actual, `${p.progress}%`]) })
      case 'project-profitability':
        return mockGet({ columns: ['Project', 'Budget', 'Actual', 'Margin'], rows: projects.map((p) => [p.name, p.budget, p.actual, p.budget - p.actual]) })
      case 'delayed-projects':
        return mockGet({ columns: ['Project', 'Status', 'Deadline'], rows: projects.filter((p) => p.status === 'on-hold' || p.stage === 'delayed').map((p) => [p.name, p.status, p.deadline]) })
      case 'budget-variance':
        return mockGet({ columns: ['Project', 'Budget', 'Actual', 'Variance'], rows: projects.map((p) => [p.name, p.budget, p.actual, p.budget - p.actual]) })
      case 'receivables':
        return mockGet({ columns: ['Invoice', 'Client', 'Amount', 'Balance'], rows: invoices.map((i) => [i.id, i.client, i.amount, i.amount - i.paid]) })
      case 'payables':
        return mockGet({ columns: ['PO', 'Vendor', 'Amount'], rows: purchaseOrders.map((p) => [p.id, p.vendor, p.rate * p.quantity]) })
      case 'attendance':
        return mockGet({ columns: ['Employee', 'Status', 'Hours'], rows: attendanceRecords.map((a) => [a.employee, a.status, a.hours]) })
      case 'leave':
        return mockGet({ columns: ['Employee', 'Type', 'Days', 'Status'], rows: leaveRequests.map((l) => [l.employee, l.type, l.days, l.status]) })
      case 'payroll':
        return mockGet({ columns: ['Period', 'Employees', 'Total Paid', 'Status'], rows: payrollRuns.map((p) => [p.period, p.employeeCount, p.totalPaid, p.status]) })
      case 'utilization':
        return mockGet({ columns: ['Employee', 'Department', 'Status'], rows: employees.map((e) => [e.name, e.department, e.status]) })
      case 'vendor-performance':
        return mockGet({ columns: ['Vendor', 'Category', 'Rating'], rows: vendors.map((v) => [v.name, v.category, v.rating]) })
      case 'spend-analysis':
        return mockGet({ columns: ['Vendor', 'Total PO Value'], rows: vendors.map((v) => [v.name, purchaseOrders.filter((p) => p.vendor === v.id).reduce((s, p) => s + p.rate * p.quantity, 0)]) })
      case 'stock':
      case 'inventory-value':
        return mockGet({ columns: ['Item', 'Category', 'Quantity', 'Value'], rows: items.map((i) => [i.name, i.category, i.quantity, i.quantity * i.unitCost]) })
      default:
        return mockGet({ columns: ['Metric', 'Value'], rows: [['No data', '-']] })
    }
  },
}
