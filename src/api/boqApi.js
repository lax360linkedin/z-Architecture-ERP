import { createCrudApi } from './createCrudApi'
import { mockGet } from './mockClient'
import { boqItems, boqCategories, estimationSummary, budgetComparison, boqTotal } from '../data/boq'

const boqCrud = createCrudApi({ store: boqItems, idPrefix: 'BOQ', searchFields: ['description', 'itemCode'] })

export const boqApi = {
  items: boqCrud,
  boqTotal,
  categories: boqCategories,
  async estimationFor(projectId) {
    return mockGet(estimationSummary[projectId] || { material: 0, labour: 0, subcontract: 0, overhead: 0, contingency: 0, marginPct: 10 })
  },
  async budgetFor(projectId) {
    return mockGet(budgetComparison[projectId] || { estimated: 0, approved: 0, committed: 0, actual: 0 })
  },
  async itemsFor(projectId) {
    return mockGet(boqItems.filter((b) => b.project === projectId))
  },
}
