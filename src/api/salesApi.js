import { createCrudApi } from './createCrudApi'
import { mockGet } from './mockClient'
import { quotations, quotationTotals } from '../data/quotations'

const quotationsApi = createCrudApi({ store: quotations, idPrefix: 'QUO', searchFields: ['title', 'id'] })

export const salesApi = {
  quotations: quotationsApi,
  quotationTotals,
  async salesAnalytics() {
    const byStatus = quotations.reduce((acc, q) => {
      acc[q.status] = (acc[q.status] || 0) + 1
      return acc
    }, {})
    const totalValue = quotations.reduce((sum, q) => sum + quotationTotals(q).total, 0)
    return mockGet({ byStatus, totalValue, count: quotations.length })
  },
}
