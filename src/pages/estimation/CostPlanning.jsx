import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, ChartCard } from '../../components/ui/Card'
import { Select } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { boqApi } from '../../api/boqApi'
import { projects } from '../../data/projects'
import { formatCurrency } from '../../utils/format'

const CATEGORY_MAP = {
  material: 'Civil Works',
  labour: 'Structural Works',
  subcontract: 'MEP Works',
  overhead: 'Finishing Works',
  contingency: 'Landscape Works',
}

export default function CostPlanning() {
  const [projectId, setProjectId] = useState(projects[0]?.id)
  const [loading, setLoading] = useState(true)
  const [planned, setPlanned] = useState(null)
  const [boqItems, setBoqItems] = useState([])

  useEffect(() => {
    setLoading(true)
    Promise.all([boqApi.estimationFor(projectId), boqApi.itemsFor(projectId)]).then(([est, items]) => {
      setPlanned(est)
      setBoqItems(items)
      setLoading(false)
    })
  }, [projectId])

  const actualByCategory = useMemo(() => {
    const totals = {}
    boqApi.categories.forEach((c) => { totals[c] = 0 })
    boqItems.forEach((item) => {
      totals[item.category] = (totals[item.category] || 0) + boqApi.boqTotal(item)
    })
    return totals
  }, [boqItems])

  const chartData = useMemo(() => {
    if (!planned) return []
    return Object.entries(CATEGORY_MAP).map(([key, category]) => ({
      category,
      planned: planned[key],
      actual: actualByCategory[category] || 0,
    }))
  }, [planned, actualByCategory])

  const totalPlanned = chartData.reduce((s, c) => s + c.planned, 0)
  const totalActual = chartData.reduce((s, c) => s + c.actual, 0)

  return (
    <div>
      <PageHeader
        title="Cost Planning"
        subtitle="Planned budget vs actual BOQ cost by category"
        actions={
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-auto min-w-[220px]">
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        }
      />
      <PageBody className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-xs font-medium text-ink-muted">Total Planned Cost</p>
            <div className="mt-2 text-2xl font-bold tracking-tight text-ink font-[Inter_Tight]">{loading ? <Skeleton className="h-8 w-32" /> : formatCurrency(totalPlanned, { compact: true })}</div>
          </Card>
          <Card>
            <p className="text-xs font-medium text-ink-muted">Total Actual (BOQ)</p>
            <div className="mt-2 text-2xl font-bold tracking-tight text-ink font-[Inter_Tight]">{loading ? <Skeleton className="h-8 w-32" /> : formatCurrency(totalActual, { compact: true })}</div>
          </Card>
        </div>

        <ChartCard title="Planned vs Actual by Category" subtitle="Category mapping: Material→Civil, Labour→Structural, Subcontract→MEP, Overhead→Finishing, Contingency→Landscape">
          {loading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ left: -10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" fontSize={11} tickLine={false} axisLine={false} stroke="#9c9ca8" interval={0} angle={-12} textAnchor="end" height={55} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" tickFormatter={(v) => formatCurrency(v, { compact: true })} width={70} />
                <RTooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="planned" name="Planned" fill="#6a3aec" radius={[6, 6, 0, 0]} maxBarSize={38} />
                <Bar dataKey="actual" name="Actual" fill="#c4b5fd" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-ink-muted">
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Planned</th>
                  <th className="px-5 py-3 font-medium">Actual</th>
                  <th className="px-5 py-3 font-medium">Variance</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-5 py-4"><Skeleton className="h-5 w-full" /></td></tr>
                ) : (
                  chartData.map((row) => {
                    const variance = row.planned - row.actual
                    return (
                      <tr key={row.category} className="border-b border-border-subtle last:border-0">
                        <td className="px-5 py-3 font-medium text-ink">{row.category}</td>
                        <td className="px-5 py-3 text-ink-muted">{formatCurrency(row.planned, { compact: true })}</td>
                        <td className="px-5 py-3 text-ink-muted">{formatCurrency(row.actual, { compact: true })}</td>
                        <td className={`px-5 py-3 font-medium ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{variance >= 0 ? '+' : ''}{formatCurrency(variance, { compact: true })}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </PageBody>
    </div>
  )
}
