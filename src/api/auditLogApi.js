import { auditLogs } from '../data/admin'
import { mockGet, nextId } from './mockClient'

// Live audit trail. Call logAudit() right after a meaningful mutation
// succeeds (invoice marked paid, drawing approved, leave approved, role
// permission changed, etc.) so Administration > Audit Logs reflects real
// session activity instead of only the seeded history.
export function logAudit({ user, action, module, record, change }) {
  auditLogs.unshift({
    id: nextId('AUD'),
    user: user?.name || 'System',
    action,
    module,
    record,
    date: new Date().toISOString(),
    ip: '10.10.4.' + (1 + Math.floor(Math.random() * 250)),
    change,
  })
}

export const auditLogApi = {
  async list() {
    return mockGet(auditLogs)
  },
}
