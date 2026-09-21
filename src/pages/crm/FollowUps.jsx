import { useMemo, useState } from 'react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { Pills } from '../../components/ui/Tabs'
import { Button } from '../../components/ui/Button'
import { PhoneCall, Mail, Calendar } from 'lucide-react'
import { leads } from '../../data/leads'
import { getEmployeeName } from '../../data/employees'
import { formatDate, formatCurrency } from '../../utils/format'
import toast from 'react-hot-toast'
import { usePermissions } from '../../context/PermissionContext'

export default function FollowUps() {
  const { can } = usePermissions()
  const allowEdit = can('crm', 'edit')
  const [range, setRange] = useState('all')
  const [done, setDone] = useState([])

  const followUps = useMemo(() => {
    const today = new Date('2024-09-19')
    return leads
      .filter((l) => l.nextFollowUp)
      .map((l) => {
        const due = new Date(l.nextFollowUp)
        const diffDays = Math.round((due - today) / 86400000)
        return { ...l, diffDays }
      })
      .filter((l) => {
        if (range === 'overdue') return l.diffDays < 0
        if (range === 'today') return l.diffDays === 0
        if (range === 'week') return l.diffDays >= 0 && l.diffDays <= 7
        return true
      })
      .sort((a, b) => a.diffDays - b.diffDays)
  }, [range])

  function markDone(id) {
    setDone((prev) => [...prev, id])
    toast.success('Follow-up marked complete')
  }

  return (
    <div>
      <PageHeader
        title="Follow-ups"
        subtitle="Upcoming and overdue lead follow-ups across your team"
        actions={<Pills value={range} onChange={setRange} options={[{ value: 'all', label: 'All' }, { value: 'overdue', label: 'Overdue' }, { value: 'today', label: 'Today' }, { value: 'week', label: 'This Week' }]} />}
      />
      <PageBody>
        {followUps.length === 0 ? (
          <Card><EmptyState title="No follow-ups in this range" description="You're all caught up." /></Card>
        ) : (
          <div className="flex flex-col gap-3">
            {followUps.map((l) => (
              <Card key={l.id} className={done.includes(l.id) ? 'opacity-50' : ''}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={l.name} />
                    <div>
                      <p className="text-sm font-semibold text-ink">{l.name}</p>
                      <p className="text-xs text-ink-faint">{l.company || l.city} · Owner: {getEmployeeName(l.owner)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge color={l.diffDays < 0 ? 'danger' : l.diffDays === 0 ? 'warning' : 'info'}>
                      <Calendar className="h-3 w-3" /> {l.diffDays < 0 ? `${-l.diffDays}d overdue` : l.diffDays === 0 ? 'Due today' : `In ${l.diffDays}d`} · {formatDate(l.nextFollowUp)}
                    </Badge>
                    <span className="text-sm font-medium text-ink">{formatCurrency(l.value, { compact: true })}</span>
                    <StatusBadge status={l.status} />
                    <div className="flex gap-1.5">
                      <a href={`tel:${l.contact}`} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-ink-muted hover:bg-surface-subtle"><PhoneCall className="h-3.5 w-3.5" /></a>
                      <a href={`mailto:${l.email}`} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-ink-muted hover:bg-surface-subtle"><Mail className="h-3.5 w-3.5" /></a>
                      {allowEdit && (
                        <Button size="sm" variant="secondary" disabled={done.includes(l.id)} onClick={() => markDone(l.id)}>
                          {done.includes(l.id) ? 'Done' : 'Mark Done'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageBody>
    </div>
  )
}
