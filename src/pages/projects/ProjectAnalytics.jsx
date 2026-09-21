import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts'
import { Gauge, IndianRupee, CheckCircle2, AlertTriangle } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader, KPICard, ChartCard } from '../../components/ui/Card'
import { CardSkeleton, Skeleton } from '../../components/ui/Skeleton'
import { projectApi } from '../../api/projectApi'
import { formatCurrency } from '../../utils/format'

const COLORS = ['#6a3aec', '#9b8afb', '#c4b5fd', '#4b21b3']
const statusLabels = { 'in-progress': 'In Progress', completed: 'Completed', 'on-hold': 'On Hold' }

export default function ProjectAnalytics() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    projectApi.all().then((data) => {
      setProjects(data)
      setLoading(false)
    })
  }, [])

  const stats = useMemo(() => {
    if (projects.length === 0) return null
    const avgProgress = projects.reduce((s, p) => s + p.progress, 0) / projects.length
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0)
    const totalActual = projects.reduce((s, p) => s + p.actual, 0)
    const today = new Date()
    const onTime = projects.filter((p) => p.status !== 'completed' && new Date(p.deadline) >= today).length
    const delayed = projects.filter((p) => p.status !== 'completed' && new Date(p.deadline) < today).length
    return { avgProgress, totalBudget, totalActual, onTime, delayed }
  }, [projects])

  const statusDist = useMemo(() => {
    const map = {}
    projects.forEach((p) => { map[p.status] = (map[p.status] || 0) + 1 })
    return Object.entries(map).map(([status, count]) => ({ status: statusLabels[status] || status, count }))
  }, [projects])

  const budgetByProject = useMemo(() => [...projects]
    .sort((a, b) => b.budget - a.budget)
    .slice(0, 8)
    .map((p) => ({ name: p.code, budget: p.budget, actual: p.actual })), [projects])

  const progressTrend = useMemo(() => [...projects]
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .map((p) => ({ name: p.code, progress: p.progress })), [projects])

  return (
    <div>
      <PageHeader title="Project Analytics" subtitle="Portfolio-wide performance across all active and completed projects" />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading || !stats ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Average Progress" value={`${stats.avgProgress.toFixed(0)}%`} icon={Gauge} accent="brand" trend="neutral" delta={`${projects.length} projects`} />
              <KPICard label="Total Budget vs Actual" value={formatCurrency(stats.totalBudget, { compact: true })} icon={IndianRupee} accent="info" trend="neutral" delta={`Actual ${formatCurrency(stats.totalActual, { compact: true })}`} />
              <KPICard label="On Schedule" value={stats.onTime} icon={CheckCircle2} accent="success" trend="up" delta="Before deadline" />
              <KPICard label="Delayed" value={stats.delayed} icon={AlertTriangle} accent={stats.delayed > 0 ? 'warning' : 'success'} trend={stats.delayed > 0 ? 'down' : 'neutral'} delta="Past deadline" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartCard title="Project Status Distribution" subtitle="Share of projects by status">
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusDist} dataKey="count" nameKey="status" innerRadius={58} outerRadius={90} paddingAngle={3}>
                    {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Budget vs Actual by Project" subtitle="Top projects by budget size" className="xl:col-span-2">
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={budgetByProject} margin={{ left: -20, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="#9c9ca8" interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={70} />
                  <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="budget" name="Budget" fill="#c4b5fd" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="actual" name="Actual" fill="#6a3aec" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <ChartCard title="Progress by Project" subtitle="Completion percentage, ordered by start date">
          {loading ? <Skeleton className="h-56 w-full" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={progressTrend} margin={{ left: -20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="#9c9ca8" interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" width={30} domain={[0, 100]} />
                <RTooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                <Bar dataKey="progress" name="Progress" fill="#6a3aec" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </PageBody>
    </div>
  )
}
