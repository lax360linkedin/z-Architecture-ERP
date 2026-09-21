import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HardHat, CalendarCheck, AlertTriangle, ClipboardCheck, CloudSun, Users } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader, KPICard } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { siteApi } from '../../api/siteApi'
import { getEmployeeName } from '../../data/employees'
import { getProjectName } from '../../data/projects'
import { formatDate } from '../../utils/format'

const severityColor = { low: 'neutral', medium: 'warning', high: 'danger' }

export default function SiteOverview() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [reports, setReports] = useState([])
  const [issues, setIssues] = useState([])

  useEffect(() => {
    Promise.all([siteApi.overview(), siteApi.reports.all(), siteApi.issues.all()]).then(([o, r, i]) => {
      setOverview(o)
      setReports([...r].sort((a, b) => new Date(b.date) - new Date(a.date)))
      setIssues(i.filter((x) => x.status === 'open'))
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <PageHeader
        title="Site Overview"
        subtitle="Live snapshot across all active construction sites"
        actions={<Button variant="secondary" onClick={() => navigate('/site-management/reports')}>View All Reports</Button>}
      />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading || !overview ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Active Sites" value={overview.activeSites} icon={HardHat} accent="brand" trend="neutral" />
              <KPICard label="Today's Visits" value={overview.todayVisits} icon={CalendarCheck} accent="info" trend="neutral" />
              <KPICard label="Open Issues" value={overview.openIssues} icon={AlertTriangle} accent="warning" trend="neutral" />
              <KPICard label="Pending Inspections" value={overview.pendingInspections} icon={ClipboardCheck} accent="success" trend="neutral" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card padded={false} className="xl:col-span-2">
            <CardHeader title="Recent Site Reports" subtitle="Latest daily progress updates" className="px-5 pt-5" />
            {loading ? (
              <div className="p-5"><CardSkeleton /></div>
            ) : reports.length === 0 ? (
              <div className="px-5 pb-5"><EmptyState title="No site reports yet" /></div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {reports.slice(0, 6).map((r) => (
                  <div key={r.id} className="flex flex-col gap-1.5 px-5 py-3.5 cursor-pointer hover:bg-surface-subtle" onClick={() => navigate('/site-management/reports')}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ink">{getProjectName(r.project)}</p>
                      <span className="flex items-center gap-1 text-xs text-ink-faint"><CloudSun className="h-3.5 w-3.5" />{r.weather}</span>
                    </div>
                    <p className="line-clamp-1 text-xs text-ink-muted">{r.workCompleted}</p>
                    <div className="flex items-center gap-3 text-xs text-ink-faint">
                      <span>{getEmployeeName(r.engineer)}</span>
                      <span>{formatDate(r.date)}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.labourCount} labourers</span>
                      {r.issues && r.issues !== 'None' && <Badge color="warning">Issue noted</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card padded={false}>
            <CardHeader title="Open Issues" subtitle={`${issues.length} unresolved`} className="px-5 pt-5" />
            {loading ? (
              <div className="p-5"><CardSkeleton /></div>
            ) : issues.length === 0 ? (
              <div className="px-5 pb-5"><EmptyState title="No open issues" description="All site issues are currently resolved." /></div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {issues.map((i) => (
                  <div key={i.id} className="px-5 py-3.5" onClick={() => navigate('/site-management/issues')}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-ink">{i.title}</p>
                      <Badge color={severityColor[i.severity]}>{i.severity}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-faint">{getProjectName(i.project)} · Raised by {getEmployeeName(i.raisedBy)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </PageBody>
    </div>
  )
}
