import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip, Legend } from 'recharts'
import { Boxes, HardHat, Users2, Building2, ShieldAlert, TrendingUp } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, KPICard, ChartCard } from '../../components/ui/Card'
import { Select } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { boqApi } from '../../api/boqApi'
import { projects } from '../../data/projects'
import { formatCurrency, formatPercent } from '../../utils/format'

const COLORS = ['#6a3aec', '#9b8afb', '#c4b5fd', '#f59e0b', '#10b981']

export default function Estimation() {
  const [projectId, setProjectId] = useState(projects[0]?.id)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    setLoading(true)
    boqApi.estimationFor(projectId).then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [projectId])

  const costTotal = data ? data.material + data.labour + data.subcontract + data.overhead + data.contingency : 0
  const marginAmount = data ? (costTotal * data.marginPct) / 100 : 0
  const estimatedTotal = costTotal + marginAmount

  const chartData = useMemo(() => {
    if (!data) return []
    return [
      { name: 'Material', value: data.material },
      { name: 'Labour', value: data.labour },
      { name: 'Subcontract', value: data.subcontract },
      { name: 'Overhead', value: data.overhead },
      { name: 'Contingency', value: data.contingency },
    ]
  }, [data])

  return (
    <div>
      <PageHeader
        title="Cost Estimation"
        subtitle="Material, labour and overhead breakdown for the selected project"
        actions={
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-auto min-w-[220px]">
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        }
      />
      <PageBody className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-7">
          {loading || !data ? (
            Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          ) : (
            <>
              <KPICard label="Material" value={formatCurrency(data.material, { compact: true })} icon={Boxes} accent="brand" trend="neutral" />
              <KPICard label="Labour" value={formatCurrency(data.labour, { compact: true })} icon={HardHat} accent="info" trend="neutral" />
              <KPICard label="Subcontract" value={formatCurrency(data.subcontract, { compact: true })} icon={Users2} accent="warning" trend="neutral" />
              <KPICard label="Overhead" value={formatCurrency(data.overhead, { compact: true })} icon={Building2} accent="brand" trend="neutral" />
              <KPICard label="Contingency" value={formatCurrency(data.contingency, { compact: true })} icon={ShieldAlert} accent="warning" trend="neutral" />
              <KPICard label="Profit Margin" value={formatPercent(data.marginPct)} icon={TrendingUp} accent="success" trend="up" delta={formatCurrency(marginAmount, { compact: true })} deltaLabel="margin amount" />
              <KPICard label="Estimated Total" value={formatCurrency(estimatedTotal, { compact: true })} icon={TrendingUp} accent="success" trend="up" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartCard title="Cost Breakdown" subtitle="Share of each category in total estimated cost" className="xl:col-span-2">
            {loading || !data ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <RTooltip formatter={(v) => formatCurrency(v, { compact: true })} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <Card className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-ink">Summary</p>
            {loading || !data ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <div className="flex flex-col divide-y divide-border-subtle text-sm">
                <div className="flex items-center justify-between py-2"><span className="text-ink-muted">Total Cost</span><span className="font-medium text-ink">{formatCurrency(costTotal, { compact: true })}</span></div>
                <div className="flex items-center justify-between py-2"><span className="text-ink-muted">Margin ({formatPercent(data.marginPct)})</span><span className="font-medium text-emerald-600">{formatCurrency(marginAmount, { compact: true })}</span></div>
                <div className="flex items-center justify-between py-2.5"><span className="font-semibold text-ink">Estimated Total</span><span className="text-base font-bold text-ink font-[Inter_Tight]">{formatCurrency(estimatedTotal, { compact: true })}</span></div>
              </div>
            )}
          </Card>
        </div>
      </PageBody>
    </div>
  )
}
