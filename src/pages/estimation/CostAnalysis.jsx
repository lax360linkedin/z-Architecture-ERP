import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, ChartCard } from '../../components/ui/Card'
import { Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { boqApi } from '../../api/boqApi'
import { projects, getProjectName } from '../../data/projects'
import { formatCurrency } from '../../utils/format'

export default function CostAnalysis() {
  const [scope, setScope] = useState('all')
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])

  useEffect(() => {
    setLoading(true)
    const targets = scope === 'all' ? projects : projects.filter((p) => p.id === scope)
    Promise.all(targets.map((p) => boqApi.budgetFor(p.id).then((b) => ({ project: p.id, ...b })))).then((results) => {
      setRows(results)
      setLoading(false)
    })
  }, [scope])

  const rowsWithVariance = useMemo(
    () => rows.map((r) => ({ ...r, variance: r.approved - r.actual })),
    [rows]
  )

  const totals = useMemo(() => {
    return rowsWithVariance.reduce(
      (acc, r) => ({
        estimated: acc.estimated + r.estimated,
        approved: acc.approved + r.approved,
        committed: acc.committed + r.committed,
        actual: acc.actual + r.actual,
      }),
      { estimated: 0, approved: 0, committed: 0, actual: 0 }
    )
  }, [rowsWithVariance])

  const chartData = rowsWithVariance.map((r) => ({ name: getProjectName(r.project).split(' ').slice(0, 2).join(' '), approved: r.approved, actual: r.actual }))

  return (
    <div>
      <PageHeader
        title="Cost Analysis"
        subtitle="Budget vs actual across projects — estimated, approved, committed and actual"
        actions={
          <Select value={scope} onChange={(e) => setScope(e.target.value)} className="w-auto min-w-[220px]">
            <option value="all">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        }
      />
      <PageBody className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card>
            <p className="text-xs font-medium text-ink-muted">Estimated</p>
            <div className="mt-2 text-xl font-bold tracking-tight text-ink font-[Inter_Tight]">{loading ? <Skeleton className="h-7 w-24" /> : formatCurrency(totals.estimated, { compact: true })}</div>
          </Card>
          <Card>
            <p className="text-xs font-medium text-ink-muted">Approved</p>
            <div className="mt-2 text-xl font-bold tracking-tight text-ink font-[Inter_Tight]">{loading ? <Skeleton className="h-7 w-24" /> : formatCurrency(totals.approved, { compact: true })}</div>
          </Card>
          <Card>
            <p className="text-xs font-medium text-ink-muted">Committed</p>
            <div className="mt-2 text-xl font-bold tracking-tight text-ink font-[Inter_Tight]">{loading ? <Skeleton className="h-7 w-24" /> : formatCurrency(totals.committed, { compact: true })}</div>
          </Card>
          <Card>
            <p className="text-xs font-medium text-ink-muted">Actual</p>
            <div className="mt-2 text-xl font-bold tracking-tight text-ink font-[Inter_Tight]">{loading ? <Skeleton className="h-7 w-24" /> : formatCurrency(totals.actual, { compact: true })}</div>
          </Card>
        </div>

        <ChartCard title="Approved vs Actual" subtitle="Comparison across selected projects">
          {loading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ left: -10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="#9c9ca8" interval={0} angle={-12} textAnchor="end" height={55} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={70} />
                <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="approved" name="Approved" fill="#6a3aec" radius={[6, 6, 0, 0]} maxBarSize={38} />
                <Bar dataKey="actual" name="Actual" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-muted">
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Estimated</th>
                  <th className="px-5 py-3 font-medium">Approved</th>
                  <th className="px-5 py-3 font-medium">Committed</th>
                  <th className="px-5 py-3 font-medium">Actual</th>
                  <th className="px-5 py-3 font-medium">Variance</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-4"><Skeleton className="h-5 w-full" /></td></tr>
                ) : (
                  rowsWithVariance.map((r) => (
                    <tr key={r.project} className="border-b border-border-subtle last:border-0">
                      <td className="px-5 py-3 font-medium text-ink">{getProjectName(r.project)}</td>
                      <td className="px-5 py-3 text-ink-muted">{formatCurrency(r.estimated, { compact: true })}</td>
                      <td className="px-5 py-3 text-ink-muted">{formatCurrency(r.approved, { compact: true })}</td>
                      <td className="px-5 py-3 text-ink-muted">{formatCurrency(r.committed, { compact: true })}</td>
                      <td className="px-5 py-3 text-ink-muted">{formatCurrency(r.actual, { compact: true })}</td>
                      <td className="px-5 py-3">
                        <Badge color={r.variance < 0 ? 'danger' : 'success'}>
                          {r.variance >= 0 ? '+' : ''}{formatCurrency(r.variance, { compact: true })}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </PageBody>
    </div>
  )
}
