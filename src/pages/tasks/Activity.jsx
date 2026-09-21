import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader } from '../../components/ui/Card'
import { Select, SearchInput } from '../../components/ui/Input'
import { Timeline } from '../../components/ui/Timeline'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageLoader } from '../../components/layout/PageLoader'
import { taskApi } from '../../api/taskApi'
import { getEmployeeName, employees } from '../../data/employees'
import { formatRelativeTime } from '../../utils/format'
import { useAuth } from '../../context/AuthContext'

export default function Activity() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [userFilter, setUserFilter] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    taskApi.allForUser(user).then((tasks) => {
      // Aggregate each accessible task's own activity log into one feed —
      // this replaces the old generic mock feed with real per-task history.
      const flattened = tasks.flatMap((t) => (t.activity || []).map((entry) => ({ ...entry, taskId: t.id, taskTitle: t.title })))
      flattened.sort((a, b) => new Date(b.time) - new Date(a.time))
      setItems(flattened)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

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
        return i.action.toLowerCase().includes(q) || i.taskTitle.toLowerCase().includes(q) || getEmployeeName(i.user).toLowerCase().includes(q)
      })
  }, [items, userFilter, query])

  if (loading) return <PageLoader />

  return (
    <div>
      <PageHeader title="Activity" subtitle={`${items.length} task update(s) across the tasks you can access`} />
      <PageBody>
        <Card>
          <CardHeader
            title="Task Activity"
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
                  <button onClick={() => navigate(`/tasks/${item.taskId}`)} className="font-medium text-brand-600 hover:underline">
                    {item.taskTitle}
                  </button>
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
