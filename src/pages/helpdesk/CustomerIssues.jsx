import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AlertTriangle, Calendar } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { SearchInput, Select, Field } from '../../components/ui/Input'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Drawer } from '../../components/ui/Drawer'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { helpdeskApi } from '../../api/helpdeskApi'
import { ticketStatuses } from '../../data/helpdesk'
import { getCustomerName } from '../../data/customers'
import { getEmployeeName } from '../../data/employees'
import { formatDate } from '../../utils/format'
import { TicketConversation } from './Tickets'

export default function CustomerIssues() {
  const [loading, setLoading] = useState(true)
  const [issues, setIssues] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [detail, setDetail] = useState(null)

  function load() {
    setLoading(true)
    helpdeskApi.tickets.all().then((all) => {
      setIssues(all.filter((t) => t.priority === 'high'))
      setLoading(false)
    })
  }

  useEffect(load, [])

  async function changeStatus(status) {
    const updated = await helpdeskApi.tickets.update(detail.id, { status })
    setDetail(updated)
    toast.success(`Issue marked as ${status}`)
    load()
  }

  const filtered = issues
    .filter((t) => status === 'all' || t.status === status)
    .filter((t) => {
      if (!query) return true
      const q = query.toLowerCase()
      return t.subject.toLowerCase().includes(q) || getCustomerName(t.customer).toLowerCase().includes(q)
    })

  return (
    <div>
      <PageHeader title="Customer Issues" subtitle={`${issues.length} escalated (high priority) customer issues`} />
      <PageBody>
        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Search issues…" className="w-full max-w-xs" />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto min-w-[140px]">
              <option value="all">All Status</option>
              {ticketStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState icon={AlertTriangle} title="No escalated issues" description="High-priority tickets will show up here." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((t) => (
                  <Card key={t.id} className="flex cursor-pointer flex-col gap-3" onClick={() => setDetail(t)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{t.subject}</p>
                        <p className="text-xs text-ink-faint">{getCustomerName(t.customer)}</p>
                      </div>
                      <Badge color="danger">high</Badge>
                    </div>
                    <p className="text-xs text-ink-muted">Assigned to {getEmployeeName(t.assignedTo)}</p>
                    <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                      <span className="flex items-center gap-1.5 text-xs text-ink-faint"><Calendar className="h-3.5 w-3.5" />{formatDate(t.createdDate)}</span>
                      <StatusBadge status={t.status} />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </PageBody>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.subject} description={detail ? `${detail.id} · ${getCustomerName(detail.customer)}` : ''} size="lg">
        {detail && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <Field label="Status" className="w-44">
                <Select value={detail.status} onChange={(e) => changeStatus(e.target.value)}>
                  {ticketStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
              <Badge color="danger">high priority</Badge>
              <span className="text-xs text-ink-faint">Assigned to {getEmployeeName(detail.assignedTo)}</span>
            </div>
            <TicketConversation ticket={detail} onSent={setDetail} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
