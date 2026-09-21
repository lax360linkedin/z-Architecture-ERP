import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { CardSkeleton } from '../../components/ui/Skeleton'
import { siteApi } from '../../api/siteApi'
import { projects } from '../../data/projects'
import { formatCurrency, formatDate } from '../../utils/format'

export default function SiteProgress() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])

  useEffect(() => {
    siteApi.reports.all().then((data) => {
      setReports(data)
      setLoading(false)
    })
  }, [])

  function latestReportFor(projectId) {
    return reports
      .filter((r) => r.project === projectId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  }

  return (
    <div>
      <PageHeader title="Site Progress" subtitle="Cross-project construction progress and latest site status" />
      <PageBody>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => {
              const latest = latestReportFor(p.id)
              return (
                <Card key={p.id} className="flex cursor-pointer flex-col gap-3" onClick={() => navigate(`/projects/${p.id}`)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink">{p.name}</p>
                      <p className="flex items-center gap-1 text-xs text-ink-faint"><MapPin className="h-3 w-3" />{p.location}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-ink-muted">Stage: {p.stage}</p>
                  <ProgressBar value={p.progress} color="auto" showLabel />
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span>Budget: {formatCurrency(p.budget, { compact: true })}</span>
                    <span>Actual: {formatCurrency(p.actual, { compact: true })}</span>
                  </div>
                  <div className="border-t border-border-subtle pt-2.5">
                    {latest ? (
                      <>
                        <p className="text-xs font-medium text-ink-faint">Latest site update · {formatDate(latest.date)}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">{latest.workCompleted}</p>
                      </>
                    ) : (
                      <p className="text-xs text-ink-faint">No site reports filed yet.</p>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </PageBody>
    </div>
  )
}
