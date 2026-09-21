import { createCrudApi } from './createCrudApi'
import { mockGet, mockMutate, paginate, searchItems, sortItems } from './mockClient'
import { projects } from '../data/projects'
import { milestones, tasks } from '../data/tasks'
import { drawings } from '../data/drawings'
import { designs } from '../data/designs'
import { documents } from '../data/designs'
import { boqItems } from '../data/boq'
import { canAccessProject } from '../utils/permissions'

const projectsApi = createCrudApi({ store: projects, idPrefix: 'PRJ', searchFields: ['name', 'code', 'location'] })

export const projectApi = {
  ...projectsApi,
  // Same shape as list(), but pre-filtered to the projects `user` may
  // access (see canAccessProject in utils/permissions.js — Super Admin/
  // Admin/MD see everything, everyone else only their assigned projects)
  // before search/sort/pagination run, so counts and pages stay correct.
  async listForUser(user, { query = '', page = 1, pageSize = 10, sortBy, sortDir, filters = {} } = {}) {
    let scoped = projects.filter((p) => canAccessProject(user, p))
    scoped = searchItems(scoped, query, ['name', 'code', 'location'])
    Object.entries(filters).forEach(([key, value]) => {
      if (value == null || value === '' || value === 'all') return
      scoped = scoped.filter((item) => item[key] === value)
    })
    scoped = sortItems(scoped, sortBy, sortDir)
    return mockGet(paginate(scoped, { page, pageSize }))
  },
  async allForUser(user) {
    const scoped = projects.filter((p) => canAccessProject(user, p))
    return mockGet(scoped)
  },
  async milestonesFor(projectId) {
    return mockGet(milestones.filter((m) => m.project === projectId))
  },
  async tasksFor(projectId) {
    return mockGet(tasks.filter((t) => t.project === projectId))
  },
  async drawingsFor(projectId) {
    return mockGet(drawings.filter((d) => d.project === projectId))
  },
  async designsFor(projectId) {
    return mockGet(designs.filter((d) => d.project === projectId))
  },
  async documentsFor(projectId) {
    return mockGet(documents.filter((d) => d.project === projectId))
  },
  async boqFor(projectId) {
    return mockGet(boqItems.filter((b) => b.project === projectId))
  },
  async updateProgress(projectId, progress) {
    return mockMutate(() => {
      const p = projects.find((x) => x.id === projectId)
      if (p) p.progress = progress
      return p
    })
  },
}
