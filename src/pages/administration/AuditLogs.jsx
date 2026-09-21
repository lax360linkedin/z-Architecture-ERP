import { useEffect, useMemo, useState } from 'react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { SearchInput, Select } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { adminApi } from '../../api/adminApi'
import { formatDate } from '../../utils/format'

export default function AuditLogs() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [query, setQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')

  useEffect(() => {
    adminApi.auditLogs().then((data) => {
      setLogs(data)
      setLoading(false)
    })
  }, [])

  const modules = useMemo(() => [...new Set(logs.map((l) => l.module))], [logs])

  const filtered = useMemo(() => {
    let items = logs
    if (moduleFilter !== 'all') items = items.filter((l) => l.module === moduleFilter)
    if (query) {
      const q = query.toLowerCase()
      items = items.filter((l) => [l.user, l.action, l.record, l.change].some((v) => String(v).toLowerCase().includes(q)))
    }
    return items
  }, [logs, query, moduleFilter])

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="A record of key actions taken across the system" />
      <PageBody>
        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Search audit logs…" className="w-full max-w-xs" />
            <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="w-auto min-w-[160px]">
              <option value="all">All Modules</option>
              {modules.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </div>
          {loading ? (
            <div className="p-4"><Skeleton className="h-64 w-full" /></div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No audit records found" description="Try adjusting your search or module filter." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-ink-muted">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-5 py-3 font-medium">Module</th>
                    <th className="px-5 py-3 font-medium">Record</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">IP Address</th>
                    <th className="px-5 py-3 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-subtle">
                      <td className="px-5 py-3 font-medium text-ink">{l.user}</td>
                      <td className="px-5 py-3 text-ink-muted">{l.action}</td>
                      <td className="px-5 py-3 text-ink-muted">{l.module}</td>
                      <td className="px-5 py-3 font-mono text-xs text-ink">{l.record}</td>
                      <td className="px-5 py-3 text-ink-muted">{formatDate(l.date, { withTime: true })}</td>
                      <td className="px-5 py-3 font-mono text-xs text-ink-muted">{l.ip}</td>
                      <td className="px-5 py-3 font-mono text-xs text-ink-muted">{l.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </PageBody>
    </div>
  )
}
