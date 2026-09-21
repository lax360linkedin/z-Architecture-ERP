import { useEffect, useMemo, useState } from 'react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Select, SearchInput } from '../../components/ui/Input'
import { Timeline } from '../../components/ui/Timeline'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageLoader } from '../../components/layout/PageLoader'
import { taskApi } from '../../api/collaborationApi'
import { getEmployeeName, employees } from '../../data/employees'
import { formatRelativeTime } from '../../utils/format'

export default function Activity() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [userFilter, setUserFilter] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    taskApi.activity().then((data) => {
      setItems(data)
      setLoading(false)
    })
  }, [])

  const activityUsers = useMemo(() => {
    const ids = [...new Set(items.map((i) => i.user))]
    return employees.filter((e) => ids.includes(e.id))
  }, [items])

  const filtered = useMemo(() => {
    return items
      .filter((i) => userFilter === 'all' || i.user === userFilter)
      .filter((i) => {
        if (!query) return true
        const q = query.toLowerCase()
        return i.action.toLowerCase().includes(q) || i.target.toLowerCase().includes(q) || getEmployeeName(i.user).toLowerCase().includes(q)
      })
      .sort((a, b) => new Date(b.time) - new Date(a.time))
  }, [items, userFilter, query])

  if (loading) return <PageLoader />

  return (
    <div>
      <PageHeader title="Activity" subtitle={`${items.length} recent updates across your organization`} />
      <PageBody>
        <Card>
          <CardHeader
            title="Recent Activity"
            subtitle="Filter by team member or search by action"
            action={
              <div className="flex items-center gap-2">
                <SearchInput value={query} onChange={setQuery} placeholder="Search activity…" className="w-56" />
                <Select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="w-auto min-w-[160px]">
                  <option value="all">All Team Members</option>
                  {activityUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </Select>
              </div>
            }
          />
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : filtered.length === 0 ? (
            <EmptyState title="No activity found" description="Try adjusting your filters." />
          ) : (
            <Timeline
              items={filtered}
              renderContent={(item) => (
                <p className="text-sm text-ink">
                  <span className="font-medium">{getEmployeeName(item.user)}</span>{' '}
                  <span className="text-ink-muted">{item.action}</span>{' '}
                  <span className="font-medium">{item.target}</span>
                  <span className="ml-2 text-xs text-ink-faint">{formatRelativeTime(item.time)}</span>
                </p>
              )}
            />
          )}
        </Card>
      </PageBody>
    </div>
  )
}
