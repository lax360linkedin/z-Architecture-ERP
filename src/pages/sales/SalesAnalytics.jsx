import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts'
import { IndianRupee, Target, TrendingUp, FileClock } from 'lucide-react'
import { PageHeader, PageBody } from '../../components/layout/PageHeader'
import { Card, CardHeader, KPICard, ChartCard } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import { CardSkeleton, Skeleton } from '../../components/ui/Skeleton'
import { salesApi } from '../../api/salesApi'
import { getCustomerName } from '../../data/customers'
import { formatCurrency, formatDate } from '../../utils/format'

export default function SalesAnalytics() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [quotations, setQuotations] = useState([])

  useEffect(() => {
    Promise.all([salesApi.salesAnalytics(), salesApi.quotations.all()]).then(([a, q]) => {
      setAnalytics(a)
      setQuotations(q)
      setLoading(false)
    })
  }, [])

  const stats = useMemo(() => {
    if (!analytics) return null
    const approved = analytics.byStatus.approved || 0
    const rejected = analytics.byStatus.rejected || 0
    const winRate = approved + rejected > 0 ? (approved / (approved + rejected)) * 100 : 0
    const avgDeal = analytics.count > 0 ? analytics.totalValue / analytics.count : 0
    const open = (analytics.byStatus.draft || 0) + (analytics.byStatus.sent || 0)
    return { winRate, avgDeal, open }
  }, [analytics])

  const statusChartData = useMemo(() => {
    if (!analytics) return []
    return Object.entries(analytics.byStatus).map(([status, count]) => ({ status: status.charAt(0).toUpperCase() + status.slice(1), count }))
  }, [analytics])

  const topQuotations = useMemo(() => {
    return [...quotations]
      .map((q) => ({ ...q, total: salesApi.quotationTotals(q).total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
  }, [quotations])

  return (
    <div>
      <PageHeader title="Sales Analytics" subtitle="Pipeline performance and quotation conversion" />
      <PageBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading || !analytics || !stats ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <KPICard label="Total Pipeline Value" value={formatCurrency(analytics.totalValue, { compact: true })} icon={IndianRupee} accent="brand" trend="neutral" delta={`${analytics.count} quotations`} />
              <KPICard label="Win Rate" value={`${stats.winRate.toFixed(0)}%`} icon={Target} accent="success" trend={stats.winRate >= 50 ? 'up' : 'down'} delta="Approved vs Rejected" />
              <KPICard label="Avg Deal Size" value={formatCurrency(stats.avgDeal, { compact: true })} icon={TrendingUp} accent="info" trend="neutral" delta="Per quotation" />
              <KPICard label="Open Quotations" value={stats.open} icon={FileClock} accent="warning" trend="neutral" delta="Draft + Sent" />
            </>
          )}
        </div>

        <ChartCard title="Quotations by Status" subtitle="Count of quotations across each pipeline stage">
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusChartData} margin={{ left: -20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" fontSize={12} tickLine={false} axisLine={false} stroke="#9c9ca8" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9c9ca8" width={30} allowDecimals={false} />
                <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e4e4eb', fontSize: 12 }} />
                <Bar dataKey="count" name="Quotations" fill="#6a3aec" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <Card padded={false}>
          <CardHeader title="Top Quotations by Value" subtitle="Highest value quotations across the pipeline" className="px-5 pt-5" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs text-ink-muted">
                  <th className="px-5 py-2.5 font-medium">ID</th>
                  <th className="px-5 py-2.5 font-medium">Title</th>
                  <th className="px-5 py-2.5 font-medium">Client</th>
                  <th className="px-5 py-2.5 font-medium">Date</th>
                  <th className="px-5 py-2.5 font-medium">Value</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border-subtle"><td className="px-5 py-3" colSpan={6}><Skeleton className="h-5 w-full" /></td></tr>
                    ))
                  : topQuotations.map((q) => (
                      <tr key={q.id} className="cursor-pointer border-b border-border-subtle last:border-0 hover:bg-surface-subtle" onClick={() => navigate(`/sales/quotations/${q.id}`)}>
                        <td className="px-5 py-3 font-medium text-ink">{q.id}</td>
                        <td className="px-5 py-3 text-ink-muted line-clamp-1 max-w-[240px]">{q.title}</td>
                        <td className="px-5 py-3 text-ink-muted">{getCustomerName(q.client)}</td>
                        <td className="px-5 py-3 text-ink-muted">{formatDate(q.date)}</td>
                        <td className="px-5 py-3 font-medium text-ink">{formatCurrency(q.total, { compact: true })}</td>
                        <td className="px-5 py-3"><StatusBadge status={q.status} /></td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </Card>
      </PageBody>
    </div>
  )
}
