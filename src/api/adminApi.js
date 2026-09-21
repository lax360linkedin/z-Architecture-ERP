import { createCrudApi } from './createCrudApi'
import { mockGet } from './mockClient'
import { company, branches, systemUsers, permissionModules, rolePermissions, approvalWorkflows, numberingSchemes, taxSettings, auditLogs } from '../data/admin'

export const adminApi = {
  branches: createCrudApi({ store: branches, idPrefix: 'BR', searchFields: ['name', 'city'] }),
  users: createCrudApi({ store: systemUsers, idPrefix: 'USR', searchFields: ['name', 'email', 'role'] }),
  workflows: createCrudApi({ store: approvalWorkflows, idPrefix: 'WF', searchFields: ['name', 'module'] }),
  async company() {
    return mockGet(company)
  },
  async permissionModules() {
    return mockGet(permissionModules)
  },
  async rolePermissions() {
    return mockGet(rolePermissions)
  },
  async numberingSchemes() {
    return mockGet(numberingSchemes)
  },
  async taxSettings() {
    return mockGet(taxSettings)
  },
  async auditLogs() {
    return mockGet(auditLogs)
  },
}
