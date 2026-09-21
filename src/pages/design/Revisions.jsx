import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { History } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Timeline } from '../../components/ui/Timeline'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { designApi } from '../../api/designApi'
import { drawingCategories } from '../../data/drawings'
import { projects, getProjectName } from '../../data/projects'
import { formatDate } from '../../utils/format'

export default function Revisions() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [drawings, setDrawings] = useState([])
  const [project, setProject] = useState('all')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    designApi.drawings.all().then((d) => {
      setDrawings(d)
      setLoading(false)
    })
  }, [])

  const feed = useMemo(() => {
    const events = []
    drawings
      .filter((d) => (project === 'all' || d.project === project) && (category === 'all' || d.category === category))
      .forEach((d) => {
        d.revisions.forEach((r, idx) => {
          events.push({
            id: `${d.id}-${idx}`,
            time: r.date,
            drawing: d,
            rev: r.rev,
            note: r.note,
            isLatest: idx === d.revisions.length - 1,
          })
        })
      })
    return events.sort((a, b) => new Date(b.time) - new Date(a.time))
  }, [drawings, project, category])

  return (
    <div>
      <PageHeader title="Revisions" subtitle={`${feed.length} revision events across all drawings`} />
      <PageBody className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={project} onChange={(e) => setProject(e.target.value)} className="w-auto min-w-[180px]">
            <option value="all">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-auto min-w-[160px]">
            <option value="all">All Categories</option>
            {drawingCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>

        <Card>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : feed.length === 0 ? (
            <EmptyState icon={History} title="No revision activity found" description="Try adjusting your filters." />
          ) : (
            <Timeline
              items={feed}
              renderContent={(item) => (
                <div className="cursor-pointer" onClick={() => navigate(`/design/drawings/${item.drawing.id}`)}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-ink">{item.drawing.number}</p>
                    <Badge>{item.rev}</Badge>
                    {item.isLatest && <Badge color="success">Latest</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-muted">{item.note}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">{getProjectName(item.drawing.project)} · {formatDate(item.time)}</p>
                </div>
              )}
            />
          )}
        </Card>
      </PageBody>
    </div>
  )
}
