import { mockGet, mockMutate } from './mockClient'
import { projects } from '../data/projects'
import { drawings } from '../data/drawings'
import { documents } from '../data/designs'
import { quotations } from '../data/quotations'
import { invoices } from '../data/invoices'
import { siteReports } from '../data/site'
import { meetings } from '../data/meetings'
import { tickets } from '../data/helpdesk'

export const clientPortalApi = {
  async projectsFor(customerId) {
    return mockGet(projects.filter((p) => p.client === customerId))
  },
  async drawingsFor(customerId) {
    const projectIds = projects.filter((p) => p.client === customerId).map((p) => p.id)
    return mockGet(drawings.filter((d) => projectIds.includes(d.project)))
  },
  async documentsFor(customerId) {
    const projectIds = projects.filter((p) => p.client === customerId).map((p) => p.id)
    return mockGet(documents.filter((d) => projectIds.includes(d.project)))
  },
  async quotationsFor(customerId) {
    return mockGet(quotations.filter((q) => q.client === customerId))
  },
  async invoicesFor(customerId) {
    return mockGet(invoices.filter((i) => i.client === customerId))
  },
  async sitePhotosFor(customerId) {
    const projectIds = projects.filter((p) => p.client === customerId).map((p) => p.id)
    return mockGet(siteReports.filter((s) => projectIds.includes(s.project)))
  },
  async meetingsFor(customerId) {
    const projectIds = projects.filter((p) => p.client === customerId).map((p) => p.id)
    return mockGet(meetings.filter((m) => projectIds.includes(m.project)))
  },
  async ticketsFor(customerId) {
    return mockGet(tickets.filter((t) => t.customer === customerId))
  },
  async approveDrawing(drawingId) {
    return mockMutate(() => {
      const d = drawings.find((x) => x.id === drawingId)
      if (d) d.status = 'approved'
      return d
    })
  },
  async requestRevision(drawingId, note) {
    return mockMutate(() => {
      const d = drawings.find((x) => x.id === drawingId)
      if (d) d.status = 'revision-requested'
      return { drawingId, note }
    })
  },
}
