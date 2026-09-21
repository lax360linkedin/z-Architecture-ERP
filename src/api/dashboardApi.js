import { mockGet } from './mockClient'
import { projects } from '../data/projects'
import { invoices } from '../data/invoices'
import { leads } from '../data/leads'
import { opportunities } from '../data/opportunities'
import { employees } from '../data/employees'
import { milestones } from '../data/tasks'
import { purchaseOrders } from '../data/procurement'
import { activityFeed } from '../data/tasks'

export const dashboardApi = {
  async kpis() {
    const revenue = invoices.reduce((s, i) => s + i.paid, 0)
    const expenses = Math.round(revenue * 0.62)
    const netProfit = revenue - expenses
    const activeProjects = projects.filter((p) => p.status === 'in-progress').length
    const pendingPayments = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + (i.amount - i.paid), 0)
    const newLeads = leads.filter((l) => l.status === 'new').length
    const teamMembers = employees.filter((e) => e.status === 'active').length
    return mockGet({ revenue, netProfit, activeProjects, pendingPayments, newLeads, teamMembers })
  },
  async revenueTrend() {
    return mockGet([
      { month: 'Apr', revenue: 28500000, expenses: 18200000 },
      { month: 'May', revenue: 31200000, expenses: 19500000 },
      { month: 'Jun', revenue: 27800000, expenses: 17600000 },
      { month: 'Jul', revenue: 35400000, expenses: 21200000 },
      { month: 'Aug', revenue: 39100000, expenses: 24800000 },
      { month: 'Sep', revenue: 33600000, expenses: 20900000 },
    ])
  },
  async cashFlow() {
    return mockGet([
      { month: 'Apr', inflow: 26500000, outflow: 21200000 },
      { month: 'May', inflow: 29800000, outflow: 22500000 },
      { month: 'Jun', inflow: 24200000, outflow: 19800000 },
      { month: 'Jul', inflow: 33100000, outflow: 24600000 },
      { month: 'Aug', inflow: 37200000, outflow: 27100000 },
      { month: 'Sep', inflow: 30800000, outflow: 23400000 },
    ])
  },
  async projectStatusDistribution() {
    const statuses = ['in-progress', 'completed', 'on-hold']
    return mockGet(statuses.map((status) => ({ status, count: projects.filter((p) => p.status === status).length })))
  },
  async salesPipeline() {
    const stages = ['New', 'Qualified', 'Requirement', 'Site Visit', 'Proposal', 'Negotiation', 'Won']
    return mockGet(stages.map((stage) => ({ stage, count: opportunities.filter((o) => o.stage === stage).length, value: opportunities.filter((o) => o.stage === stage).reduce((s, o) => s + o.value, 0) })))
  },
  async projectPerformance() {
    return mockGet(
      projects.slice(0, 6).map((p) => ({
        id: p.id, name: p.name, client: p.client, manager: p.manager, budget: p.budget, actual: p.actual, progress: p.progress, status: p.status,
      }))
    )
  },
  async outstandingReceivables() {
    return mockGet(invoices.filter((i) => i.status !== 'paid'))
  },
  async upcomingDeadlines() {
    return mockGet(milestones.filter((m) => m.status !== 'completed').slice(0, 6))
  },
  async pendingApprovals() {
    return mockGet([
      { id: 'PO-2024-144', type: 'Purchase Order', description: 'Landscape Package - Green Valley Residence', amount: 3200000, requestedBy: 'EMP-013' },
      { id: 'QUO-2024-063', type: 'Quotation', description: 'Greenfield Township - Master Planning', amount: 8362500, requestedBy: 'EMP-005' },
      { id: 'LV-802', type: 'Leave Request', description: 'Ishita Bhatt - Casual Leave (2 days)', amount: null, requestedBy: 'EMP-010' },
    ])
  },
  async recentActivity() {
    return mockGet(activityFeed)
  },
}
