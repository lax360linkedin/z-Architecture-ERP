import { createCrudApi } from './createCrudApi'
import { invoices } from '../data/invoices'
import { mockGet } from './mockClient'

const invoicesApi = createCrudApi({ store: invoices, idPrefix: 'INV', searchFields: ['id'] })

const creditNotes = [
  { id: 'CN-2024-004', client: 'CUST-002', invoice: 'INV-2024-0112', amount: 85000, date: '2024-08-10', reason: 'Scope reduction adjustment', status: 'issued' },
]
const debitNotes = [
  { id: 'DN-2024-002', client: 'CUST-008', invoice: 'INV-2024-0121', amount: 42000, date: '2024-09-08', reason: 'Additional site visits billed', status: 'issued' },
]
const payments = [
  { id: 'PAY-3001', invoice: 'INV-2024-0112', client: 'CUST-002', amount: 4750000, date: '2024-08-05', mode: 'Bank Transfer', status: 'cleared' },
  { id: 'PAY-3002', invoice: 'INV-2024-0095', client: 'CUST-008', amount: 1800000, date: '2024-06-18', mode: 'Bank Transfer', status: 'cleared' },
  { id: 'PAY-3003', invoice: 'INV-2024-0130', client: 'CUST-006', amount: 2000000, date: '2024-09-14', mode: 'Cheque', status: 'cleared' },
  { id: 'PAY-3004', invoice: 'INV-2024-0080', client: 'CUST-007', amount: 720000, date: '2024-05-03', mode: 'UPI', status: 'cleared' },
]

export const billingApi = {
  invoices: invoicesApi,
  creditNotes: createCrudApi({ store: creditNotes, idPrefix: 'CN', searchFields: ['client'] }),
  debitNotes: createCrudApi({ store: debitNotes, idPrefix: 'DN', searchFields: ['client'] }),
  payments: createCrudApi({ store: payments, idPrefix: 'PAY', searchFields: ['client', 'invoice'] }),
  async markPaid(invoiceId, amount) {
    const inv = invoices.find((i) => i.id === invoiceId)
    if (inv) {
      inv.paid = Math.min(inv.amount, inv.paid + amount)
      inv.status = inv.paid >= inv.amount ? 'paid' : 'partially-paid'
    }
    return mockGet(inv)
  },
}
