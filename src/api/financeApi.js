import { createCrudApi } from './createCrudApi'
import { mockGet } from './mockClient'
import { invoices } from '../data/invoices'
import { purchaseInvoices } from '../data/procurement'

const invoicesApi = createCrudApi({ store: invoices, idPrefix: 'INV', searchFields: ['id'] })

export const financeApi = {
  invoices: invoicesApi,
  async overview() {
    const revenue = invoices.reduce((s, i) => s + i.amount, 0)
    const collected = invoices.reduce((s, i) => s + i.paid, 0)
    const receivable = revenue - collected
    const payable = purchaseInvoices.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amount, 0)
    const overdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + (i.amount - i.paid), 0)
    return mockGet({ revenue, collected, receivable, payable, overdue, cashBalance: 84500000 })
  },
  async receivablesAging() {
    const now = new Date('2024-09-19')
    const buckets = { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
    invoices.forEach((i) => {
      const outstanding = i.amount - i.paid
      if (outstanding <= 0) return
      const days = Math.floor((now - new Date(i.dueDate)) / 86400000)
      if (days <= 0) buckets.current += outstanding
      else if (days <= 30) buckets['1-30'] += outstanding
      else if (days <= 60) buckets['31-60'] += outstanding
      else if (days <= 90) buckets['61-90'] += outstanding
      else buckets['90+'] += outstanding
    })
    return mockGet(buckets)
  },
  async payables() {
    return mockGet(purchaseInvoices)
  },
}
