import { createCrudApi } from './createCrudApi'
import { tickets, serviceRequests } from '../data/helpdesk'
import { mockMutate } from './mockClient'

export const helpdeskApi = {
  tickets: createCrudApi({ store: tickets, idPrefix: 'TKT', searchFields: ['subject', 'customer'] }),
  serviceRequests: createCrudApi({ store: serviceRequests, idPrefix: 'SVC', searchFields: ['type'] }),
  async addMessage(ticketId, message) {
    return mockMutate(() => {
      const t = tickets.find((x) => x.id === ticketId)
      if (!t) throw new Error('not found')
      t.messages.push({ ...message, time: new Date().toISOString() })
      return t
    })
  },
}
