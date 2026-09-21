import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader, KPICard } from '../../components/ui/Card'
import { CardSkeleton, Skeleton } from '../../components/ui/Skeleton'
import { boqApi } from '../../api/boqApi'
import { projects } from '../../data/projects'
import { getCustomerName } from '../../data/customers'
import { formatCurrency, classNames } from '../../utils/format'
import { IndianRupee, AlertTriangle, TrendingDown } from 'lucide-react'

export default function ProjectBudget() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])

  useEffect(() => {
    Promise.all(projects.map(async (p) => ({ project: p, budget: await boqApi.budgetFor(p.id) }))).then((data) => {
      setRows(data)
      setLoading(false)
    })
  }, [])

  const totals = useMemo(() => {
    return rows.reduce((acc, r) => ({
      estimated: acc.estimated + r.budget.estimated,
      approved: acc.approved + r.budget.approved,
      committed: acc.committed + r.budget.committed,
      actual: acc.actual + r.budget.actual,
    }), { estimated: 0, approved: 0, committed: 0, actual: 0 })
  }, [rows])

  const overBudgetCount = rows.filter((r) => r.budget.actual > r.budget.approved).length

  const chartData = useMemo(() => rows
    .filter((r) => r.budget.approved > 0)
    .map((r) => ({ name: r.project.code, approved: r.budget.approved, actual: r.budget.actual }))
    .slice(0, 10), [rows])

  return (
    <div>
      <PageHeader title="Project Budget" subtitle="Estimated, approved, committed and actual spend across all projects" />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Total Approved Budget" value={formatCurrency(totals.approved, { compact: true })} icon={IndianRupee} accent="brand" trend="neutral" />
              <KPICard label="Total Committed" value={formatCurrency(totals.committed, { compact: true })} icon={IndianRupee} accent="info" trend="neutral" />
              <KPICard label="Total Actual Spend" value={formatCurrency(totals.actual, { compact: true })} icon={IndianRupee} accent={totals.actual > totals.approved ? 'warning' : 'success'} trend={totals.actual > totals.approved ? 'down' : 'up'} delta={totals.actual > totals.approved ? 'Over approved' : 'Within budget'} />
              <KPICard label="Projects Over Budget" value={overBudgetCount} icon={AlertTriangle} accent={overBudgetCount > 0 ? 'warning' : 'success'} trend={overBudgetCount > 0 ? 'down' : 'neutral'} />
            </>
          )}
        </div>

        <Card>
          <CardHeader title="Approved vs Actual" subtitle="Top projects by approved budget" />
          {loading ? <Skeleton className="h-64 w-full" /> : chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-muted">No budget data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ left: -20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="#9c9ca8" interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={70} />
                <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="approved" name="Approved" fill="#c4b5fd" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="actual" name="Actual" fill="#6a3aec" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card padded={false}>
          <CardHeader title="Budget by Project" subtitle="Click a row to open the project's budget tab" className="px-5 pt-5" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs text-ink-muted">
                  <th className="px-5 py-2.5 font-medium">Project</th>
                  <th className="px-5 py-2.5 font-medium">Client</th>
                  <th className="px-5 py-2.5 font-medium text-right">Estimated</th>
                  <th className="px-5 py-2.5 font-medium text-right">Approved</th>
                  <th className="px-5 py-2.5 font-medium text-right">Committed</th>
                  <th className="px-5 py-2.5 font-medium text-right">Actual</th>
                  <th className="px-5 py-2.5 font-medium text-right">Variance</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border-subtle"><td className="px-5 py-3" colSpan={7}><Skeleton className="h-5 w-full" /></td></tr>
                    ))
                  : rows.map(({ project, budget }) => {
                      const variance = budget.actual - budget.approved
                      const over = variance > 0
                      return (
                        <tr key={project.id} className="cursor-pointer border-b border-border-subtle last:border-0 hover:bg-surface-subtle" onClick={() => navigate(`/projects/${project.id}/budget`)}>
                          <td className="px-5 py-3 font-medium text-ink">{project.name}</td>
                          <td className="px-5 py-3 text-ink-muted">{getCustomerName(project.client)}</td>
                          <td className="px-5 py-3 text-right text-ink-muted">{formatCurrency(budget.estimated, { compact: true })}</td>
                          <td className="px-5 py-3 text-right text-ink-muted">{formatCurrency(budget.approved, { compact: true })}</td>
                          <td className="px-5 py-3 text-right text-ink-muted">{formatCurrency(budget.committed, { compact: true })}</td>
                          <td className="px-5 py-3 text-right text-ink-muted">{formatCurrency(budget.actual, { compact: true })}</td>
                          <td className={classNames('px-5 py-3 text-right font-medium flex items-center justify-end gap-1', over ? 'text-red-600' : 'text-emerald-600')}>
                            {over && <TrendingDown className="h-3.5 w-3.5" />}
                            {over ? '+' : ''}{formatCurrency(variance, { compact: true })}
                          </td>
                        </tr>
                      )
                    })}
              </tbody>
            </table>
          </div>
        </Card>
      </PageBody>
    </div>
  )
}
