import { createCrudApi } from './createCrudApi'
import { mockGet } from './mockClient'
import { siteReports, siteIssues, inspections, siteVisits } from '../data/site'
import { projects } from '../data/projects'

export const siteApi = {
  reports: createCrudApi({ store: siteReports, idPrefix: 'SR', searchFields: ['site', 'workCompleted'] }),
  issues: createCrudApi({ store: siteIssues, idPrefix: 'ISS', searchFields: ['title'] }),
  inspections: createCrudApi({ store: inspections, idPrefix: 'INS', searchFields: ['type'] }),
  visits: createCrudApi({ store: siteVisits, idPrefix: 'VIS', searchFields: ['purpose'] }),
  async overview() {
    const activeSites = projects.filter((p) => p.status === 'in-progress').length
    const todayVisits = siteVisits.filter((v) => v.status === 'scheduled').length
    const openIssues = siteIssues.filter((i) => i.status === 'open').length
    const pendingInspections = inspections.filter((i) => i.status === 'scheduled').length
    return mockGet({ activeSites, todayVisits, openIssues, pendingInspections })
  },
}
