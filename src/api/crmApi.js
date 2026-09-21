import { createCrudApi } from './createCrudApi'
import { mockGet, mockMutate, nextId } from './mockClient'
import { leads } from '../data/leads'
import { opportunities, pipelineStages } from '../data/opportunities'
import { customers } from '../data/customers'

const leadsApi = createCrudApi({ store: leads, idPrefix: 'LEAD', searchFields: ['name', 'company', 'email', 'city'] })
const customersApi = createCrudApi({ store: customers, idPrefix: 'CUST', searchFields: ['name', 'email', 'city'] })

export const crmApi = {
  leads: leadsApi,
  customers: customersApi,
  async listOpportunities() {
    return mockGet(opportunities)
  },
  async moveOpportunity(id, stage) {
    return mockMutate(() => {
      const opp = opportunities.find((o) => o.id === id)
      if (opp) opp.stage = stage
      return opp
    })
  },
  async createOpportunity(payload) {
    return mockMutate(() => {
      const record = { id: nextId('OPP'), stage: 'New', probability: 10, ...payload }
      opportunities.unshift(record)
      return record
    })
  },
  pipelineStages,
  async convertLead(leadId) {
    return mockMutate(() => {
      const lead = leads.find((l) => l.id === leadId)
      if (!lead) throw new Error('Lead not found')
      lead.status = 'converted'
      const customer = {
        id: nextId('CUST'),
        name: lead.company || lead.name,
        type: lead.company ? 'Corporate' : 'Individual',
        category: lead.company ? 'Corporate' : 'Homeowner',
        contact: lead.contact,
        email: lead.email,
        city: lead.city,
        gstin: null,
        status: 'active',
        since: new Date().toISOString().slice(0, 10),
      }
      customers.unshift(customer)
      return customer
    })
  },
}
