import { createCrudApi } from './createCrudApi'
import { mockGet } from './mockClient'
import { company, branches, systemUsers, permissionModuleLabels, approvalWorkflows, numberingSchemes, taxSettings, auditLogs } from '../data/admin'
import { roles } from '../data/roles'
import { can, ACTIONS } from '../utils/permissions'

const MATRIX_ACTIONS = ACTIONS.filter((a) => ['view', 'create', 'edit', 'delete', 'approve'].includes(a))

export const adminApi = {
  branches: createCrudApi({ store: branches, idPrefix: 'BR', searchFields: ['name', 'city'] }),
  users: createCrudApi({ store: systemUsers, idPrefix: 'USR', searchFields: ['name', 'email', 'role'] }),
  workflows: createCrudApi({ store: approvalWorkflows, idPrefix: 'WF', searchFields: ['name', 'module'] }),
  async company() {
    return mockGet(company)
  },
  async permissionModules() {
    return mockGet(Object.values(permissionModuleLabels))
  },
  // Computed live from src/data/roles.js's real permission grants (via the
  // same can() used everywhere else to enforce access) so this admin-facing
  // matrix can never drift out of sync with the five actual login roles.
  async rolePermissions() {
    const matrix = {}
    roles.forEach((role) => {
      matrix[role.label] = {}
      Object.entries(permissionModuleLabels).forEach(([moduleId, moduleLabel]) => {
        matrix[role.label][moduleLabel] = Object.fromEntries(
          MATRIX_ACTIONS.map((action) => [action, can(role.permissions, moduleId, action)])
        )
      })
    })
    return mockGet(matrix)
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
